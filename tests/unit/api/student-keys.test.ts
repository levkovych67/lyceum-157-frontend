import { describe, it, expect } from "vitest";
import { studentKeys } from "@/shared/api/student-keys";

describe("studentKeys", () => {
  it("products root key is stable", () => {
    expect(studentKeys.products()).toEqual(["student", "products"]);
  });
  it("product key includes id", () => {
    expect(studentKeys.product("abc")).toEqual(["student", "product", "abc"]);
  });
  it("finance and me keys are stable", () => {
    expect(studentKeys.finance()).toEqual(["student", "finance"]);
    expect(studentKeys.me()).toEqual(["student", "me"]);
  });
  it("orders root key is stable", () => {
    expect(studentKeys.orders()).toEqual(["student", "orders"]);
  });
});
