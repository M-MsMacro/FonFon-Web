import { describe, expect, it } from "vitest";
import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("keeps internal paths, including query strings", () => {
    expect(safeNext("/pro/pacientes/abc?x=1")).toBe("/pro/pacientes/abc?x=1");
  });

  it("falls back for empty values", () => {
    expect(safeNext(null)).toBe("/pro");
    expect(safeNext("")).toBe("/pro");
  });

  it("rejects external and protocol-relative targets", () => {
    expect(safeNext("https://evil.com")).toBe("/pro");
    expect(safeNext("//evil.com")).toBe("/pro");
    expect(safeNext("/\\evil.com")).toBe("/pro");
    expect(safeNext("javascript:alert(1)")).toBe("/pro");
  });
});
