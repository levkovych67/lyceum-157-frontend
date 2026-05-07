import { api } from "@/shared/api/client";

export const userApi = {
  deleteMe: () => api<void>("/users/me", { method: "DELETE" }),
};
