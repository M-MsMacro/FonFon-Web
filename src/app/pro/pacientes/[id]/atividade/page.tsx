"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PhonemeActivityRow } from "@/components/Phoneme";
import { BackLink, Stepper } from "@/components/Rows";
import { WeekChart } from "@/components/WeekChart";
import { Card, EmptyState, Loading, Notice, cx } from "@/components/ui";
import { activityForDay } from "@/lib/activity";
import { addDays, isSameDay, startOfWeek } from "@/lib/calendar";
import { messageFor } from "@/lib/errors";
import { fullDay, weekRange } from "@/lib/format";
import { useChild, useWeek, useWeekSessions } from "@/lib/hooks";
import { t } from "@/lib/strings";
import type { PhonemeActivity } from "@/lib/types";

type Scope = "week" | "day";

function Total({ minutes }: { minutes: number }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold">{t.patient.minutes(minutes)}</span>
      <span className="text-xs text-ink-2">{t.detail.activeTraining}</span>
    </p>
  );
}

function ActivityList({ items, emptyMessage }: { items: PhonemeActivity[]; emptyMessage: string }) {
  if (items.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <div className="divide-y divide-separator">
      {items.map((item) => (
        <PhonemeActivityRow key={item.phonemeKey} activity={item} />
      ))}
    </div>
  );
}

export default function AllActivityPage() {
  const { id } = useParams<{ id: string }>();
  const { child } = useChild(id);
  const [scope, setScope] = useState<Scope>("week");
  const [offset, setOffset] = useState(0);
  const [pickedDay, setPickedDay] = useState<number | null>(null);

  const thisWeek = useMemo(() => startOfWeek(), []);
  const weekStart = addDays(thisWeek, offset * 7);
  const week = useWeek(id, weekStart, true);
  const sessions = useWeekSessions(id, weekStart, scope === "day");

  const days = week.data?.days ?? [];
  const today = days.findIndex((day) => isSameDay(day.date, new Date()));
  const fallbackDay = today >= 0 ? today : days.length - 1;
  const dayIndex = pickedDay !== null && pickedDay < days.length ? pickedDay : fallbackDay;
  const day = days[dayIndex];

  const weekMinutes = days.reduce((sum, item) => sum + item.activeMinutes, 0);
  const weekItems = (week.data?.phonemeActivity ?? []).filter((item) => item.totalMinutes > 0);
  const dayItems = day && sessions.data ? activityForDay(sessions.data, day.date) : [];

  const shiftWeek = (delta: number) => {
    setOffset((value) => Math.min(0, value + delta));
    setPickedDay(null);
  };

  const tab = (value: Scope, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={scope === value}
      onClick={() => setScope(value)}
      className={cx(
        "min-h-11 flex-1 rounded-full text-sm font-medium",
        scope === value ? "bg-card text-ink shadow-sm" : "text-ink-2",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <BackLink href={`/pro/pacientes/${id}`} label={child?.name ?? t.patients.backToList} always />
      <h1 className="font-brand text-3xl">{t.detail.phonemeActivityTitle}</h1>

      <div role="tablist" className="flex gap-1 rounded-full bg-sunken p-1">
        {tab("week", t.detail.scopeWeek)}
        {tab("day", t.detail.scopeDay)}
      </div>

      {week.error && !week.data && <Notice>{messageFor(week.error)}</Notice>}
      {!week.data && !week.error && <Loading label={t.common.loading} />}

      {week.data && scope === "week" && (
        <>
          <Stepper
            label={days.length > 0 ? weekRange(days[0].date, days[days.length - 1].date) : ""}
            canPrevious
            canNext={offset < 0}
            onPrevious={() => shiftWeek(-1)}
            onNext={() => shiftWeek(1)}
          />
          <Card className="space-y-4">
            <Total minutes={weekMinutes} />
            <WeekChart key={weekStart.getTime()} days={days} />
            {weekItems.length > 0 && <ActivityList items={weekItems} emptyMessage={t.detail.phonemeActivityEmpty} />}
          </Card>
          {weekItems.length === 0 && <EmptyState message={t.detail.phonemeActivityEmpty} />}
        </>
      )}

      {week.data && scope === "day" && day && (
        <>
          <Stepper
            label={fullDay(day.date)}
            canPrevious={dayIndex > 0}
            canNext={dayIndex < days.length - 1}
            onPrevious={() => setPickedDay(Math.max(0, dayIndex - 1))}
            onNext={() => setPickedDay(Math.min(days.length - 1, dayIndex + 1))}
            previousLabel={t.detail.previousDay}
            nextLabel={t.detail.nextDay}
          />
          <Card className="space-y-4">
            <Total minutes={day.activeMinutes} />
            {!sessions.data && !sessions.error && <Loading label={t.common.loading} />}
            {sessions.error && <Notice>{messageFor(sessions.error)}</Notice>}
            {sessions.data && <ActivityList items={dayItems} emptyMessage={t.detail.phonemeActivityEmptyDay} />}
          </Card>
        </>
      )}
    </div>
  );
}
