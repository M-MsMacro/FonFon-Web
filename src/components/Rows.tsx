import Link from "next/link";
import { longDate, noteStamp, sessionStamp } from "@/lib/format";
import { symbolFor } from "@/lib/phonemes";
import { t } from "@/lib/strings";
import {
  STAGES,
  type ClinicalNote,
  type PracticeSession,
  type Prescription,
  type Stage,
  type StageProgress,
} from "@/lib/types";
import { ChevronIcon } from "./icons";
import { LetterTile, StageTrack } from "./Phoneme";
import { StatusChip, cx } from "./ui";

export function BackLink({ href, label, always = false }: { href: string; label: string; always?: boolean }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent hover:underline",
        !always && "lg:hidden",
      )}
    >
      <ChevronIcon direction="left" className="size-4" />
      {label}
    </Link>
  );
}

export function Stepper({
  label,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  previousLabel = t.detail.previousWeek,
  nextLabel = t.detail.nextWeek,
}: {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  previousLabel?: string;
  nextLabel?: string;
}) {
  const button =
    "inline-flex size-7 items-center justify-center rounded-full disabled:text-ink-3 enabled:text-ink-2 enabled:hover:bg-ink/10";
  return (
    <div className="flex items-center gap-1 rounded-full bg-ink/8 px-1.5 py-0.5">
      <button type="button" className={button} onClick={onPrevious} disabled={!canPrevious} aria-label={previousLabel}>
        <ChevronIcon direction="left" className="size-3.5" />
      </button>
      <span className="whitespace-nowrap px-1 text-center text-[15px] font-semibold" aria-live="polite">
        {label}
      </span>
      <button type="button" className={button} onClick={onNext} disabled={!canNext} aria-label={nextLabel}>
        <ChevronIcon className="size-3.5" />
      </button>
    </div>
  );
}

export function SessionRow({ session }: { session: PracticeSession }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {t.stage[session.stage]} · {symbolFor(session.phonemeKey)}
        </p>
        <p className="text-xs text-ink-2">{sessionStamp(session.startedAt, session.minutes)}</p>
      </div>
      {session.outcome === "completed" ? (
        <StatusChip text={t.detail.sessionDone} tone="done" check />
      ) : (
        <StatusChip text={t.detail.sessionAbandoned} tone="pending" />
      )}
    </div>
  );
}

export function NoteRow({ note }: { note: ClinicalNote }) {
  return (
    <div className="space-y-1 px-4 py-3">
      <p className="whitespace-pre-wrap text-sm">{note.text}</p>
      <p className="text-xs text-ink-2">{noteStamp(note.createdAt)}</p>
    </div>
  );
}

export function PrescriptionRow({
  prescription,
  progress,
}: {
  prescription: Prescription;
  progress: Record<Stage, StageProgress> | undefined;
}) {
  const isDone = prescription.state === "completed";
  const unlocksFullPath = progress ? STAGES.every((stage) => progress[stage] !== "notStarted") : false;
  const caption = isDone
    ? `${t.detail.completedOn(longDate(prescription.completedOn ?? prescription.since))} · ${t.detail.stillPlayable}`
    : unlocksFullPath
      ? t.detail.fullPathUnlocked
      : t.detail.activeSince(longDate(prescription.since));

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <LetterTile phonemeKey={prescription.phonemeKey} size={32} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{symbolFor(prescription.phonemeKey)}</p>
          <p className="text-xs text-ink-2">{caption}</p>
        </div>
        {isDone ? (
          <StatusChip text={t.status.done} tone="done" check />
        ) : (
          <StatusChip text={t.status.active} />
        )}
      </div>
      {!isDone && <StageTrack progress={progress} />}
    </div>
  );
}

export const cardLink = cx(
  "flex min-h-11 w-full items-center justify-center px-4 py-3 text-sm font-medium text-accent hover:bg-sunken",
);
