import { weekdayShort, fullDay } from "@/lib/format";
import { t } from "@/lib/strings";
import type { PracticeDay } from "@/lib/types";

const DAILY_GOAL_MINUTES = 25;
const MINUTES_PER_UNFINISHED = 2.5;
const LABEL_ROW = 26;

function axisMaxFor(days: PracticeDay[]) {
  const busiest = Math.max(
    0,
    ...days.map((day) => day.activeMinutes + day.unfinished * MINUTES_PER_UNFINISHED),
  );
  return busiest > 30 ? Math.ceil(busiest / 15) * 15 : 30;
}

export function WeekChart({ days, height = 190 }: { days: PracticeDay[]; height?: number }) {
  const axisMax = axisMaxFor(days);
  const percent = (minutes: number) => `${(minutes / axisMax) * 100}%`;
  const ticks = [axisMax, Math.round(axisMax / 2), 0];

  return (
    <div>
      <div className="relative" style={{ height: height + LABEL_ROW }}>
        <div className="absolute inset-x-0 top-0 mr-9" style={{ height }}>
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 border-t border-separator"
              style={{ bottom: percent(tick) }}
            />
          ))}
          <div
            className="absolute inset-x-0 border-t border-dashed border-accent-deep"
            style={{ bottom: percent(DAILY_GOAL_MINUTES) }}
          >
            <span className="absolute -top-5 right-0 text-[11px] font-semibold text-accent-deep">
              {t.desktop.goal(DAILY_GOAL_MINUTES)}
            </span>
          </div>
        </div>

        <div aria-hidden className="absolute right-0 top-0 w-8" style={{ height }}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 text-xs text-ink-2"
              style={{ bottom: percent(tick) }}
            >
              {tick}
            </span>
          ))}
        </div>

        <ul className="absolute inset-x-0 top-0 mr-9 grid grid-cols-7" style={{ height: height + LABEL_ROW }}>
          {days.map((day) => {
            const unfinishedMinutes = day.unfinished * MINUTES_PER_UNFINISHED;
            return (
              <li
                key={day.date.getTime()}
                role="img"
                aria-label={t.detail.weekBar(fullDay(day.date), day.activeMinutes, day.unfinished)}
                title={t.detail.weekBar(fullDay(day.date), day.activeMinutes, day.unfinished)}
                className="flex flex-col items-center"
              >
                <span className="flex w-full flex-col items-center justify-end" style={{ height }}>
                  {unfinishedMinutes > 0 && (
                    <span
                      className="w-1/2 max-w-9 rounded-t-[5px] bg-alert-strong"
                      style={{ height: percent(unfinishedMinutes) }}
                    />
                  )}
                  {day.activeMinutes > 0 && (
                    <span
                      className={`w-1/2 max-w-9 bg-accent ${unfinishedMinutes > 0 ? "" : "rounded-t-[5px]"}`}
                      style={{ height: percent(day.activeMinutes) }}
                    />
                  )}
                </span>
                <span className="flex items-end text-xs text-ink-2" style={{ height: LABEL_ROW }}>
                  {weekdayShort(day.date)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-2">
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
