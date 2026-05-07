import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

process.env.NEXT_PUBLIC_API_BASE ??= "http://localhost:8080/api/v1";
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";

afterEach(() => cleanup());
