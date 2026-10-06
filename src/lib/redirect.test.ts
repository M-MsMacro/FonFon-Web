import { describe, expect, it } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("keeps internal paths, including query strings", () => {
    expect(safeNext("/fono/pacientes/abc?x=1")).toBe("/fono/pacientes/abc?x=1");
  });

  it("falls back for empty values", () => {
    expect(safeNext(null)).toBe("/fono");
    expect(safeNext("")).toBe("/fono");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(safeNext("https://evil.com")).toBe("/fono");
    expect(safeNext("//evil.com")).toBe("/fono");
    expect(safeNext("/\\evil.com")).toBe("/fono");
    expect(safeNext("javascript:alert(1)")).toBe("/fono");
  });
});
