"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, ageInYears, startOfWeek } from "@/lib/calendar";
import { messageFor } from "@/lib/errors";
import { longDate, noteStamp, numericDate, sessionStamp, weekRange } from "@/lib/format";
import { useNotes, useRecentSessions, useWeek } from "@/lib/hooks";
import { symbolFor } from "@/lib/phonemes";
import { patientStatus, weekTotals } from "@/lib/status";
import { t } from "@/lib/strings";
import { STAGES, type Child, type PracticeSession, type Stage } from "@/lib/types";
import { AlertCircleIcon, CheckCircleIcon, DocumentIcon, NoteIcon, SidebarRightIcon } from "./icons";
import { NoteDialog } from "./NoteDialog";
import { LetterTile, StageTrack } from "./Phoneme";
import { StatusIcon } from "./PatientList";
import { PrescriptionDialog } from "./PrescriptionDialog";
import { ReportDialog } from "./ReportDialog";
import { BackLink, Stepper } from "./Rows";
import { WeekChart } from "./WeekChart";
import { Avatar, Button, CapsuleLink, Notice, StatTile, SurfaceCard, cx, initialsOf } from "./ui";

const toolbarButton =
  "inline-flex size-8 items-center justify-center rounded-full text-ink-2 hover:bg-ink/10 hover:text-ink";

function Outcome({ outcome }: { outcome: PracticeSession["outcome"] }) {
  return outcome === "completed" ? (
    <span className="inline-flex items-center gap-1 text-done">
      <CheckCircleIcon className="size-4" />
      {t.detail.sessionDone}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-alert">
      <AlertCircleIcon className="size-4" />
      {t.detail.sessionAbandoned}
    </span>
  );
}

function SessionsTable({ sessions }: { sessions: PracticeSession[] }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-page/50">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-separator text-[15px] font-medium">
            <th className="px-4 py-2">{t.desktop.columnActivity}</th>
            <th className="px-3 py-2">{t.desktop.columnPhoneme}</th>
            <th className="px-3 py-2">{t.desktop.columnDate}</th>
            <th className="px-3 py-2">{t.desktop.columnDuration}</th>
            <th className="px-3 py-2">{t.desktop.columnStatus}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-separator">
          {sessions.map((session) => (
            <tr key={session.id}>
              <td className="px-4 py-1.5">{t.stage[session.stage]}</td>
              <td className="px-3 py-1.5">{symbolFor(session.phonemeKey)}</td>
              <td className="px-3 py-1.5">{sessionStamp(session.startedAt, session.minutes).split(" · ").slice(0, 2).join(" · ")}</td>
              <td className="px-3 py-1.5">{t.patient.minutes(session.minutes)}</td>
              <td className="px-3 py-1.5">
                <Outcome outcome={session.outcome} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PatientDetail({ child }: { child: Child }) {
  const [offset, setOffset] = useState(0);
  const [prescribing, setPrescribing] = useState(false);
  const [noting, setNoting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [inspector, setInspector] = useState(true);
  const thisWeek = useMemo(() => startOfWeek(), []);
  const weekStart = addDays(thisWeek, offset * 7);

  const week = useWeek(child.id, weekStart, true);
  const currentWeek = useWeek(child.id, thisWeek, offset !== 0);
  const sessions = useRecentSessions(child.id, true, 6);
  const notes = useNotes(child.id);

  const days = week.data?.days ?? [];
  const totals = weekTotals(week.data);

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
  const base = `/fono/pacientes/${child.id}`;
  const status = patientStatus(child, offset === 0 ? week.data : currentWeek.data);
  const progress = week.data?.progress;

  const currentStage = (phonemeKey: string): Stage => {
    const stages = progress?.[phonemeKey];
    return [...STAGES].reverse().find((stage) => stages?.[stage] !== undefined && stages[stage] !== "notStarted") ?? STAGES[0];
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex min-h-14 items-center gap-3 border-b border-separator bg-page/85 px-6 py-2 backdrop-blur">
        <BackLink href="/fono" label={t.patients.backToList} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight">{child.name}</h1>
          <p className="truncate text-xs leading-tight text-ink-2">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-ink/5 p-0.5">
          <button type="button" className={toolbarButton} onClick={() => setNoting(true)} aria-label={t.desktop.newNote}>
            <NoteIcon className="size-[18px]" />
          </button>
          <button type="button" className={toolbarButton} onClick={() => setReporting(true)} aria-label={t.report.open}>
            <DocumentIcon className="size-[18px]" />
          </button>
          <button
            type="button"
            className={cx(toolbarButton, "hidden xl:inline-flex")}
            onClick={() => setInspector((value) => !value)}
            aria-pressed={inspector}
            aria-label={t.desktop.inspector}
          >
            <SidebarRightIcon className="size-[18px]" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="min-w-0 flex-1 space-y-4 p-6">
          {week.error && !week.data && (
            <Notice action={<Button variant="plain" className="min-h-8 px-0" onClick={() => week.mutate()}>{t.common.retry}</Button>}>
              {messageFor(week.error)}
            </Notice>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile value={totals.minutes} unit="min" caption={t.detail.activeTime} />
            <StatTile value={totals.activities} caption={t.detail.activities} />
            <StatTile value={totals.unfinished} caption={t.detail.unfinished} tone="alert" />
            <StatTile
              value={totals.daysTrained}
              unit={t.desktop.ofTotal(Math.max(days.length, 7))}
              caption={t.desktop.daysTrained}
            />
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-2">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{t.detail.thisWeek}</h2>
                  <p className="flex items-baseline gap-1.5">
                    <span className="whitespace-nowrap text-3xl font-semibold">{t.patient.minutes(totals.minutes)}</span>
                    <span className="text-ink-2">{t.detail.activeTraining}</span>
                  </p>
                </div>
                <Stepper
                  label={range}
                  canPrevious={canGoBack}
                  canNext={offset < 0}
                  onPrevious={() => setOffset((value) => value - 1)}
                  onNext={() => setOffset((value) => Math.min(0, value + 1))}
                />
              </div>
              {days.length > 0 && <WeekChart key={weekStart.getTime()} days={days} />}
              <Link href={`${base}/atividade`} className="inline-flex">
                <CapsuleLink>{t.detail.allActivity}</CapsuleLink>
              </Link>
            </SurfaceCard>

            <SurfaceCard className="space-y-3">
              <h2 className="font-semibold">{t.detail.activePhonemes}</h2>
              {activePrescriptions.length === 0 && <p className="text-sm text-ink-2">{t.status.noPrescription}</p>}
              {activePrescriptions.map((item) => (
                <div key={item.phonemeKey} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LetterTile phonemeKey={item.phonemeKey} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{symbolFor(item.phonemeKey)}</p>
                      <p className="text-xs text-ink-2">{t.detail.activeSince(longDate(item.since))}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-accent">
                      <span aria-hidden className="size-2 rounded-full bg-accent" />
                      {t.status.active}
                    </span>
                  </div>
                  <StageTrack progress={progress?.[item.phonemeKey]} />
                </div>
              ))}
              <Link href={`${base}/historico`} className="inline-flex">
                <CapsuleLink>{t.detail.viewHistory}</CapsuleLink>
              </Link>
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{t.desktop.recentSessions}</h2>
              <Link href={`${base}/sessoes`}>
                <CapsuleLink>{t.desktop.seeAll}</CapsuleLink>
              </Link>
            </div>
            <SessionsTable sessions={sessions.data ?? []} />
          </SurfaceCard>

          <p className="text-xs text-ink-2">{t.detail.footnote}</p>
        </div>

        <aside
          className={cx(
            "w-full space-y-4 p-4 xl:w-[310px] xl:shrink-0 xl:border-l xl:border-separator",
            !inspector && "xl:hidden",
          )}
        >
          <SurfaceCard className="flex flex-col items-center gap-1.5">
            <Avatar initials={initialsOf(child.name)} size={64} />
            <p className="text-lg font-semibold">{child.name}</p>
            <p className="flex flex-wrap items-center justify-center gap-x-2.5 text-[15px]">
              {status && (
                <span
                  className={cx(
                    "inline-flex items-center gap-1",
                    status === "attention" && "text-attention",
                    status === "onTrack" && "text-done",
                    status === "new" && "text-new",
                  )}
                >
                  <StatusIcon status={status} className="size-4" />
                  {t.desktop.status[status]}
                </span>
              )}
              <span className="text-ink-2">{t.desktop.activePhonemes(activePrescriptions.length)}</span>
            </p>
          </SurfaceCard>

          <SurfaceCard className="space-y-2.5">
            <h2 className="font-semibold">{t.desktop.profile}</h2>
            {guardian && (
              <div className="flex justify-between gap-3 text-[15px]">
                <span>{t.desktop.guardian}</span>
                <span className="text-ink-2">{guardian}</span>
              </div>
            )}
            <div className="flex justify-between gap-3 text-[15px]">
              <span>{t.desktop.birth}</span>
              <span className="text-right text-ink-2">
                {numericDate(child.birthDate)} · {t.patient.age(ageInYears(child.birthDate))}
              </span>
            </div>
          </SurfaceCard>

          <SurfaceCard className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t.desktop.activePrescription}</h2>
              <button type="button" className="text-[15px] text-accent hover:underline" onClick={() => setPrescribing(true)}>
                {t.desktop.change}
              </button>
            </div>
            {activePrescriptions.length === 0 && <p className="text-sm text-ink-2">{t.status.noPrescription}</p>}
            {activePrescriptions.map((item) => (
              <div key={item.phonemeKey} className="flex items-center gap-2.5">
                <LetterTile phonemeKey={item.phonemeKey} size={28} />
                <div>
                  <p className="leading-tight">{symbolFor(item.phonemeKey)}</p>
                  <p className="text-xs text-ink-2">{t.stage[currentStage(item.phonemeKey)]}</p>
                </div>
              </div>
            ))}
          </SurfaceCard>

          <SurfaceCard className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t.desktop.privateNotes}</h2>
              <button type="button" className="text-[15px] text-accent hover:underline" onClick={() => setNoting(true)}>
                {t.desktop.newNote}
              </button>
            </div>
            {notes.error && !notes.data && <Notice>{messageFor(notes.error)}</Notice>}
            <div className="divide-y divide-separator">
              {(notes.data ?? []).map((note) => (
                <div key={note.id} className="space-y-0.5 py-2">
                  <p className="whitespace-pre-wrap text-[15px]">{note.text}</p>
                  <p className="text-xs text-ink-2">{noteStamp(note.createdAt)}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </aside>
      </div>

      {prescribing && <PrescriptionDialog open onClose={() => setPrescribing(false)} child={child} />}
      {reporting && (
        <ReportDialog
          open
          onClose={() => setReporting(false)}
          data={{
            firstName: child.name.split(" ")[0],
            days,
            prescriptions: child.prescriptions,
            progress,
            sessions: sessions.data ?? [],
          }}
        />
      )}
      {noting && <NoteDialog open onClose={() => setNoting(false)} childId={child.id} />}
    </div>
  );
}
