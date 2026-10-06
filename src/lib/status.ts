import type { Child, WeekMetrics } from "./types";

export type PatientStatus = "attention" | "onTrack" | "new";

export type Filter = "all" | "attention" | "onTrack" | "new" | "requests";

export const FILTERS: readonly Filter[] = ["all", "attention", "onTrack", "new", "requests"];

export function weekTotals(week: WeekMetrics | undefined) {
  const days = week?.days ?? [];
  return {
    minutes: days.reduce((sum, day) => sum + day.activeMinutes, 0),
    activities: days.reduce((sum, day) => sum + day.activities, 0),
    unfinished: days.reduce((sum, day) => sum + day.unfinished, 0),
    daysTrained: days.filter((day) => day.activeMinutes > 0).length,
  };
}

export function patientStatus(child: Child, week: WeekMetrics | undefined): PatientStatus | null {
  if (child.link.status === "pending") return null;
  if (child.prescriptions.length === 0) return "new";
  if (!week) return null;
  const { minutes, unfinished } = weekTotals(week);
  return minutes > 0 && unfinished === 0 ? "onTrack" : "attention";
}

export function matchesFilter(filter: Filter, child: Child, week: WeekMetrics | undefined): boolean {
  const pending = child.link.status === "pending";
  if (filter === "requests") return pending;
  if (pending) return false;
  if (filter === "all") return true;
  return patientStatus(child, week) === filter;
}
