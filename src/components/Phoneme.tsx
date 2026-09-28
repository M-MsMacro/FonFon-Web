import Image from "next/image";
import { islandFor, symbolFor } from "@/lib/phonemes";
import { t } from "@/lib/strings";
import { STAGES, type PhonemeActivity, type Stage, type StageProgress } from "@/lib/types";
import { CheckIcon } from "./icons";
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

const progressStyle: Record<StageProgress, string> = {
  completed: "bg-done-soft text-done border-done-border",
  inProgress: "bg-accent-soft text-accent-deep border-accent-mid",
  notStarted: "bg-sunken text-ink-2 border-card-border",
};

export function StageTrack({ progress }: { progress: Record<Stage, StageProgress> | undefined }) {
  return (
    <ol className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {STAGES.map((stage) => {
        const state = progress?.[stage] ?? "notStarted";
        return (
          <li
            key={stage}
            className={cx(
              "flex flex-col items-center gap-0.5 rounded-small border px-1 py-1.5 text-center text-[11px] font-medium",
              progressStyle[state],
            )}
          >
            <span className="inline-flex items-center gap-0.5">
              {state === "completed" && <CheckIcon className="size-3" />}
              {t.stage[stage]}
            </span>
            <span className="text-[10px] font-normal opacity-80">{t.progress[state]}</span>
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
