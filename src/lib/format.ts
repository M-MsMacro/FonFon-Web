import { isSameDay } from "./calendar";
import { t } from "./strings";

const locale = "pt-BR";

const clean = (text: string) => text.replace(/\./g, "");
const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const time = (date: Date) =>
  date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false });

export const weekdayShort = (date: Date) =>
  clean(date.toLocaleDateString(locale, { weekday: "short" })).toLowerCase();

export const dayAndMonth = (date: Date) =>
  clean(date.toLocaleDateString(locale, { day: "numeric", month: "short" }));

export const fullDay = (date: Date) =>
  upperFirst(date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }));

export const longDate = (date: Date) =>
  date.toLocaleDateString(locale, { day: "numeric", month: "long" });

export const numericDate = (date: Date) =>
  date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });

export function weekRange(start: Date, end: Date): string {
  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  return sameMonth
    ? `${start.getDate()}–${dayAndMonth(end)}`
    : `${dayAndMonth(start)}–${dayAndMonth(end)}`;
}

export function sessionStamp(date: Date, minutes: number): string {
  const day = upperFirst(
    clean(date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" })),
  );
  return `${day} · ${time(date)} · ${minutes} min`;
}

export const noteStamp = (date: Date) => `${dayAndMonth(date)}, ${time(date)}`;

export function requestStamp(date: Date, now: Date = new Date()): string {
  return isSameDay(date, now) ? `${t.common.today}, ${time(date)}` : `${dayAndMonth(date)}, ${time(date)}`;
}
