import type { ProblemDetail } from "./types";

export type { ProblemDetail };

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.title || `HTTP ${problem.status}`);
    this.name = "ApiError";
  }
  get isValidation() {
    return this.problem.status === 400;
  }
  get isUnauthorized() {
    return this.problem.status === 401;
  }
  get isForbidden() {
    return this.problem.status === 403;
  }
  get isNotFound() {
    return this.problem.status === 404;
  }
  get isConflict() {
    return this.problem.status === 409;
  }
  get isUnsupported() {
    return this.problem.status === 415;
  }
  get isTransient() {
    return this.problem.status >= 500;
  }
}

export function fallbackProblem(res: { status: number; statusText?: string }): ProblemDetail {
  return {
    type: "about:blank",
    title: res.statusText || `HTTP ${res.status}`,
    status: res.status,
    detail: "",
    instance: "",
    timestamp: new Date().toISOString(),
  };
}
