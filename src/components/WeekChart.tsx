"use client";

import { useState } from "react";
import { weekdayShort } from "@/lib/format";
import { fullDay } from "@/lib/format";
import { t } from "@/lib/strings";
import type { PracticeDay } from "@/lib/types";

const CHART_HEIGHT = 140;
const UNFINISHED_CAP = 7;
const EMPTY_BAR = 2;

const niceMax = (minutes: number) => Math.max(10, Math.ceil(minutes / 10) * 10);

export function WeekChart({ days }: { days: PracticeDay[] }) {
  const busiest = days.reduce((best, day) => (day.activeMinutes > (best?.activeMinutes ?? -1) ? day : best), days[0]);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = days.find((day) => day.date.getTime() === picked) ?? busiest;
  const axisMax = niceMax(Math.max(...days.map((day) => day.activeMinutes), 0));

  if (!selected) return null;

  return (
    <div>
      <p className="mb-3 text-sm text-ink-2" aria-live="polite">
        <span className="font-medium text-ink">{fullDay(selected.date)}</span>
        {" · "}
        {t.detail.dayDetail(selected.activeMinutes, selected.activities)}
      </p>

      <div className="flex gap-2">
        <div
          aria-hidden
          className="flex flex-col justify-between pb-6 text-right text-[11px] text-ink-2"
          style={{ height: CHART_HEIGHT + 24 }}
        >
          <span>{axisMax}</span>
          <span>{Math.round(axisMax / 2)}</span>
          <span>0</span>
        </div>

        <ul className="grid flex-1 grid-cols-7 gap-1" style={{ height: CHART_HEIGHT + 24 }}>
          {days.map((day) => {
            const isSelected = day.date.getTime() === selected.date.getTime();
            const barHeight = day.activeMinutes > 0 ? (day.activeMinutes / axisMax) * CHART_HEIGHT : EMPTY_BAR;
            const cap = Math.min(day.unfinished * UNFINISHED_CAP, 28);
            return (
              <li key={day.date.getTime()} className="flex flex-col">
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={t.detail.weekBar(fullDay(day.date), day.activeMinutes, day.unfinished)}
                  onClick={() => setPicked(day.date.getTime())}
                  className="flex h-full flex-col items-center justify-end rounded-small pb-0 hover:bg-sunken"
                >
                  <span className="flex w-full flex-1 flex-col items-center justify-end">
                    {cap > 0 && (
                      <span className="w-6 rounded-t-md bg-alert-strong" style={{ height: cap }} />
                    )}
                    <span
                      className={`w-6 ${cap > 0 ? "" : "rounded-t-md"} ${isSelected ? "bg-accent" : "bg-accent-mid"}`}
                      style={{ height: barHeight }}
                    />
                  </span>
                  <span
                    className={`mt-1 h-5 text-xs ${isSelected ? "font-semibold text-ink" : "text-ink-2"}`}
                  >
                    {weekdayShort(day.date)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm bg-accent" />
          {t.detail.legendMinutes}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-sm bg-alert-strong" />
          {t.detail.legendUnfinished}
        </span>
      </div>
    </div>
  );
}
