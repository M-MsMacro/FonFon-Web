import Image from "next/image";
import { islandFor, symbolFor } from "@/lib/phonemes";
import { t } from "@/lib/strings";
import { STAGES, type PhonemeActivity, type Stage, type StageProgress } from "@/lib/types";
import { cx } from "./ui";

export function PhonemeBadge({ phonemeKey, tone = "accent" }: { phonemeKey: string; tone?: "accent" | "done" }) {
  const island = islandFor(phonemeKey);
  return (
    <span
      className={cx(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-small border",
        tone === "done" ? "border-done-border bg-done-soft" : "border-accent-mid bg-accent-soft",
      )}
    >
      {island ? (
        <Image src={island.image} alt="" width={48} height={48} className="size-full object-cover" />
      ) : (
        <span className="font-brand text-lg text-accent-deep">{symbolFor(phonemeKey).slice(0, 2)}</span>
      )}
    </span>
  );
}

const progressValue: Record<StageProgress, number> = { completed: 100, inProgress: 50, notStarted: 0 };

export function LetterTile({ phonemeKey, size = 32 }: { phonemeKey: string; size?: number }) {
  const island = islandFor(phonemeKey);
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-ink/10 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {(island?.letter ?? symbolFor(phonemeKey)).toLowerCase()}
    </span>
  );
}

export function StageTrack({ progress }: { progress: Record<Stage, StageProgress> | undefined }) {
  return (
    <ol className="grid grid-cols-4 gap-1.5">
      {STAGES.map((stage) => {
        const state = progress?.[stage] ?? "notStarted";
        return (
          <li key={stage} aria-label={`${t.stage[stage]}: ${t.progress[state]}`}>
            <span className="block h-1.5 overflow-hidden rounded-full bg-ink/10">
              <span
                className="block h-full rounded-full bg-accent-deep"
                style={{ width: `${progressValue[state]}%` }}
              />
            </span>
            <span className="mt-1 block truncate text-[11px] text-ink-2">{t.stage[stage]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function PhonemeActivityRow({ activity }: { activity: PhonemeActivity }) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold">{symbolFor(activity.phonemeKey)}</h3>
        <span className="text-sm">{t.patient.minutes(activity.totalMinutes)}</span>
      </div>

      <ul className="space-y-2">
        {STAGES.map((stage) => {
          const minutes = activity.stageMinutes[stage];
          const fraction = minutes && activity.totalMinutes > 0 ? minutes / activity.totalMinutes : 0;
          return (
            <li key={stage} className="flex items-center gap-2.5 text-xs">
              <span className="w-24 text-ink-2">{t.stage[stage]}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${fraction * 100}%` }} />
              </span>
              <span className={cx("w-12 text-right", minutes === undefined ? "text-ink-3" : "text-ink")}>
                {minutes === undefined ? "—" : t.patient.minutes(minutes)}
              </span>
            </li>
          );
        })}
      </ul>

      {activity.unfinishedStage && activity.unfinishedCount > 0 && (
        <p className="text-xs text-alert">
          {t.detail.stageUnfinished(activity.unfinishedCount, t.stage[activity.unfinishedStage])}
        </p>
      )}
    </div>
  );
}
