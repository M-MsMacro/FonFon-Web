"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, ageInYears, startOfWeek } from "@/lib/calendar";
import { messageFor } from "@/lib/errors";
import { weekRange } from "@/lib/format";
import { useNotes, useRecentSessions, useWeek } from "@/lib/hooks";
import { t } from "@/lib/strings";
import type { Child } from "@/lib/types";
import { CalendarIcon } from "./icons";
import { NoteDialog } from "./NoteDialog";
import { PrescriptionDialog } from "./PrescriptionDialog";
import { BackLink, NoteRow, PrescriptionRow, SessionRow, Stepper, cardLink } from "./Rows";
import { WeekChart } from "./WeekChart";
import { Button, Card, EmptyState, GroupedCard, Notice, SectionHeader, StatTile } from "./ui";

export function PatientDetail({ child }: { child: Child }) {
  const [offset, setOffset] = useState(0);
  const [prescribing, setPrescribing] = useState(false);
  const [noting, setNoting] = useState(false);
  const thisWeek = useMemo(() => startOfWeek(), []);
  const weekStart = addDays(thisWeek, offset * 7);

  const week = useWeek(child.id, weekStart, true);
  const sessions = useRecentSessions(child.id, true);
  const notes = useNotes(child.id);

  const days = week.data?.days ?? [];
  const totalMinutes = days.reduce((sum, day) => sum + day.activeMinutes, 0);
  const totalActivities = days.reduce((sum, day) => sum + day.activities, 0);
  const totalUnfinished = days.reduce((sum, day) => sum + day.unfinished, 0);

  const knownDates = [
    ...child.prescriptions.map((item) => item.completedOn ?? item.since),
    ...(sessions.data ?? []).map((session) => session.startedAt),
  ];
  const earliest = knownDates.length > 0 ? new Date(Math.min(...knownDates.map((date) => date.getTime()))) : null;
  const canGoBack = earliest === null || earliest < weekStart;
  const range = days.length > 0 ? weekRange(days[0].date, days[days.length - 1].date) : "";

  const activePrescriptions = child.prescriptions.filter((item) => item.state === "active");
  const guardian = child.link.status === "active" ? child.link.guardianName : child.guardianName;
  const subtitle = [t.patient.age(ageInYears(child.birthDate)), guardian ? t.patient.guardian(guardian) : null]
    .filter(Boolean)
    .join(" · ");
  const base = `/pro/pacientes/${child.id}`;

  return (
    <div className="space-y-6">
      <BackLink href="/pro" label={t.patients.backToList} />

      <header>
        <h1 className="font-brand text-3xl">{child.name}</h1>
        <p className="text-sm text-ink-2">{subtitle}</p>
      </header>

      {week.error && !week.data && (
        <Notice action={<Button variant="plain" onClick={() => week.mutate()}>{t.common.retry}</Button>}>
          {messageFor(week.error)}
        </Notice>
      )}

      <div className="flex gap-2">
        <StatTile value={totalMinutes} unit="min" caption={t.detail.activeTime} />
        <StatTile value={totalActivities} caption={t.detail.activities} />
        <StatTile value={totalUnfinished} caption={t.detail.unfinished} tone="alert" />
      </div>

      <section>
        <SectionHeader
          title={t.detail.activePhonemes}
          action={
            <Button variant="plain" className="min-h-8 px-0 text-sm" onClick={() => setPrescribing(true)}>
              {t.detail.changePrescription}
            </Button>
          }
        />
        <GroupedCard>
          {activePrescriptions.length === 0 && <p className="px-4 py-4 text-sm text-ink-2">{t.status.noPrescription}</p>}
          {activePrescriptions.map((item) => (
            <PrescriptionRow key={item.phonemeKey} prescription={item} progress={week.data?.progress[item.phonemeKey]} />
          ))}
          <Link href={`${base}/historico`} className={cardLink}>
            {t.detail.viewHistory}
          </Link>
        </GroupedCard>
      </section>

      <section>
        <SectionHeader
          title={t.detail.thisWeek}
          action={
            <Stepper
              label={range}
              canPrevious={canGoBack}
              canNext={offset < 0}
              onPrevious={() => setOffset((value) => value - 1)}
              onNext={() => setOffset((value) => Math.min(0, value + 1))}
            />
          }
        />
        <Card className="space-y-4">
          <p className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{t.patient.minutes(totalMinutes)}</span>
            <span className="text-xs text-ink-2">{t.detail.activeTraining}</span>
          </p>
          {days.length > 0 && <WeekChart key={weekStart.getTime()} days={days} />}
          <Link href={`${base}/atividade`} className="block border-t border-separator pt-3 text-center text-sm font-medium text-accent hover:underline">
            {t.detail.allActivity}
          </Link>
        </Card>
      </section>

      <section>
        <SectionHeader title={t.detail.recentSessions} />
        <GroupedCard>
          {sessions.data && sessions.data.length === 0 ? (
            <EmptyState icon={<CalendarIcon className="size-6" />} message={t.detail.sessionsEmpty} />
          ) : (
            <>
              {(sessions.data ?? []).map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
              <Link href={`${base}/sessoes`} className={cardLink}>
                {t.detail.allSessions}
              </Link>
            </>
          )}
        </GroupedCard>
      </section>

      <section>
        <SectionHeader
          title={t.detail.notes}
          action={
            <Button variant="plain" className="min-h-8 px-0 text-sm" onClick={() => setNoting(true)}>
              + {t.detail.newNote}
            </Button>
          }
        />
        <GroupedCard>
          {notes.error && !notes.data && <Notice>{messageFor(notes.error)}</Notice>}
          {notes.data && notes.data.length === 0 && <EmptyState message={t.detail.notesEmpty} />}
          {(notes.data ?? []).map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </GroupedCard>
      </section>

      <p className="text-xs text-ink-2">{t.detail.footnote}</p>

      {prescribing && <PrescriptionDialog open onClose={() => setPrescribing(false)} child={child} />}
      {noting && <NoteDialog open onClose={() => setNoting(false)} childId={child.id} />}
    </div>
  );
}
