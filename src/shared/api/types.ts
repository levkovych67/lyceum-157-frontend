export type Role = "STUDENT" | "PARENT" | "ADMIN";

export type TokenSnapshot = {
  accessToken: string;
  userId: string;
  role: Role;
  expiresAt: number; // ms epoch
};

export type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  invalidParams?: Array<{ field: string; reason: string }>;
  extensions?: Record<string, unknown>;
};

export type Page<T> = {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
