# syntax=docker/dockerfile:1.7
# Next.js 14 + pnpm production image.

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-lock.yaml package.json ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S next && adduser -S -G next -u 10001 next && \
    apk add --no-cache wget
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=next:next /app/.next        ./.next
COPY --from=builder --chown=next:next /app/public       ./public
COPY --from=builder --chown=next:next /app/node_modules ./node_modules
COPY --from=builder --chown=next:next /app/package.json ./package.json
COPY --from=builder --chown=next:next /app/next.config.mjs ./next.config.mjs
USER next
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ >/dev/null || exit 1
CMD ["./node_modules/.bin/next", "start"]
