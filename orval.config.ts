import { defineConfig } from "orval";

export default defineConfig({
  lyceumApi: {
    input: { target: "./api.json" },
    output: {
      mode: "tags-split",
      target: "./src/shared/api/generated/endpoints.ts",
      schemas: "./src/shared/api/generated/models",
      client: "react-query",
      clean: true,
      override: {
        mutator: {
          path: "./src/shared/api/orval-mutator.ts",
          name: "customFetch",
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
        query: {
          useQuery: true,
          useMutation: true,
          options: { staleTime: 60_000 },
          signal: true,
        },
      },
    },
  },
});
