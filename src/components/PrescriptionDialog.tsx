"use client";

import Image from "next/image";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { setPrescription } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { PHONEME_ISLANDS, type PhonemeIsland } from "@/lib/phonemes";
import { t } from "@/lib/strings";
import type { Child, PrescriptionItem } from "@/lib/types";
import { Dialog } from "./Dialog";
import { Button, Notice, SectionHeader, StatusChip, cx, type Tone } from "./ui";

type Draft = "available" | "active" | "completed";

const next: Record<Draft, Draft> = { available: "active", active: "completed", completed: "available" };
const tone: Record<Draft, Tone> = { available: "neutral", active: "accent", completed: "done" };

export function PrescriptionDialog({
  open,
  onClose,
  child,
}: {
  open: boolean;
  onClose: () => void;
  child: Child;
}) {
  const { mutate } = useSWRConfig();
  const [original] = useState(() => new Map<string, Draft>(child.prescriptions.map((item) => [item.phonemeKey, item.state])));
  const [draft, setDraft] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(PHONEME_ISLANDS.map((island) => [island.id, original.get(island.id) ?? "available"])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateOf = (island: PhonemeIsland): Draft => draft[island.id] ?? "available";
  const changes = PHONEME_ISLANDS.filter((island) => stateOf(island) !== (original.get(island.id) ?? "available")).length;
  const activeCount = PHONEME_ISLANDS.filter((island) => stateOf(island) === "active").length;

  async function save() {
    const items: PrescriptionItem[] = PHONEME_ISLANDS.flatMap((island) => {
      const state = stateOf(island);
      return state === "available" ? [] : [{ phonemeKey: island.id, state }];
    });
    setBusy(true);
    setError(null);
    try {
      await setPrescription(child.id, items);
      await mutate("children");
      await mutate((key) => Array.isArray(key) && key[0] === "week" && key[1] === child.id);
      onClose();
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  const sections: { title: string; state: Draft }[] = [
    { title: t.prescription.active, state: "active" },
    { title: t.prescription.available, state: "available" },
    { title: t.prescription.completed, state: "completed" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.prescription.title}
      footer={
        <div className="space-y-2">
          {error && (
            <Notice action={<Button variant="plain" onClick={save}>{t.common.retry}</Button>}>{error}</Notice>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-2" aria-live="polite">
              {t.prescription.activeAfterSaving(activeCount)}
              {changes > 0 && ` · ${t.prescription.pendingChanges(changes)}`}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                {t.common.cancel}
              </Button>
              <Button onClick={save} disabled={busy || changes === 0}>
                {busy ? t.prescription.saving : t.common.save}
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {sections.map(({ title, state }) => {
          const islands = PHONEME_ISLANDS.filter((island) => stateOf(island) === state);
          return (
            <section key={state}>
              <SectionHeader title={title} as="h3" />
              {islands.length > 0 && (
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {islands.map((island) => (
                    <li key={island.id}>
                      <button
                        type="button"
                        onClick={() => setDraft((current) => ({ ...current, [island.id]: next[stateOf(island)] }))}
                        aria-label={`${island.symbol}, ${t.prescription.stateLabel[stateOf(island)]}`}
                        className={cx(
                          "flex w-full flex-col gap-2 rounded-medium border bg-card p-2 text-left hover:bg-sunken",
                          state === "active" ? "border-accent" : "border-card-border",
                        )}
                      >
                        <Image
                          src={island.image}
                          alt={t.prescription.island(island.symbol)}
                          width={200}
                          height={200}
                          className="aspect-square w-full rounded-small object-cover"
                        />
                        <span className="flex items-center justify-between gap-2 px-1 pb-1">
                          <span className="font-semibold">{island.symbol}</span>
                          <StatusChip text={t.prescription.stateLabel[state]} tone={tone[state]} check={state === "completed"} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
        <p className="text-xs text-ink-2">{t.prescription.footnote}</p>
      </div>
    </Dialog>
  );
}
