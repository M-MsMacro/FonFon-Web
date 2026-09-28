export const DAILY_TARGET_MINUTES = 25;

export type Intensity = "none" | "low" | "medium" | "high" | "peak";

export function parseDay(text: string): Date {
  const [year, month, day] = text.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function dayString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function startOfWeek(date: Date = new Date()): Date {
  const sinceMonday = (date.getDay() + 6) % 7;
  return addDays(date, -sinceMonday);
}

export function intensity(minutes: number): Intensity {
  if (minutes <= 0) return "none";
  const ratio = minutes / DAILY_TARGET_MINUTES;
  if (ratio < 0.34) return "low";
  if (ratio < 0.67) return "medium";
  if (ratio < 1) return "high";
  return "peak";
}

export function ageInYears(birth: Date, now: Date = new Date()): number {
  let years = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthday) years -= 1;
  return Math.max(0, years);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
