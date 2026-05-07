import { publicEnv } from "@/shared/config/env";

export const API_BASE = publicEnv.NEXT_PUBLIC_API_BASE;
export const ACCESS_TOKEN_TTL_SEC = 900;
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const PRESIGNED_UPLOAD_TTL_SEC = 300;
export const IDEMPOTENCY_REPLAY_WINDOW_HOURS = 24;
export const REFRESH_PROACTIVE_MS = 60_000;
