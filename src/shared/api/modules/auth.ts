import { api } from "@/shared/api/client";
import type { Role } from "@/shared/api/types";

export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  grade: string;
  parentEmail: string;
};
export type RegisterResponse = { userId: string; message: string };

export type LoginRequest = { email: string; password: string };
export type TokenResponse = {
  accessToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  userId: string;
  role: Role;
};

export const authApi = {
  register: (b: RegisterRequest) =>
    api<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(b),
      auth: false,
    }),
  login: (b: LoginRequest) =>
    api<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(b), auth: false }),
  refresh: () => api<TokenResponse>("/auth/refresh", { method: "POST", auth: false }),
  logout: () => api<void>("/auth/logout", { method: "POST", auth: false }),
};
