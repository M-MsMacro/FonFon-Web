import { describe, expect, it } from "vitest";
import { ageInYears, dayString, intensity, parseDay, startOfWeek } from "./calendar";

describe("calendar", () => {
  it("parses a yyyy-mm-dd string as a local calendar day", () => {
    const day = parseDay("2026-09-28");
    expect([day.getFullYear(), day.getMonth(), day.getDate()]).toEqual([2026, 8, 28]);
    expect(dayString(day)).toBe("2026-09-28");
  });

  it("starts the week on Monday, including from a Sunday", () => {
    expect(dayString(startOfWeek(new Date(2026, 8, 28)))).toBe("2026-09-28");
    expect(dayString(startOfWeek(new Date(2026, 9, 4)))).toBe("2026-09-28");
    expect(dayString(startOfWeek(new Date(2026, 9, 1)))).toBe("2026-09-28");
  });

  it("maps daily minutes to intensity against the 25 minute target", () => {
    expect(intensity(0)).toBe("none");
    expect(intensity(5)).toBe("low");
    expect(intensity(12)).toBe("medium");
    expect(intensity(20)).toBe("high");
    expect(intensity(25)).toBe("peak");
  });

  it("counts full years only after the birthday", () => {
    const birth = new Date(2020, 5, 15);
    expect(ageInYears(birth, new Date(2026, 5, 14))).toBe(5);
    expect(ageInYears(birth, new Date(2026, 5, 15))).toBe(6);
  });
});
