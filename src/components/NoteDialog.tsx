"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";
import { addNote } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { t } from "@/lib/strings";
import { Dialog } from "./Dialog";
import { Button, Notice } from "./ui";

export function NoteDialog({
  open,
  onClose,
  childId,
}: {
  open: boolean;
  onClose: () => void;
  childId: string;
}) {
  const { mutate } = useSWRConfig();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = text.trim();

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await addNote(childId, trimmed);
      await mutate(["notes", childId]);
      setText("");
      onClose();
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.note.title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={save} disabled={!trimmed || busy}>
            {t.common.save}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="block">
          <span className="sr-only">{t.note.title}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t.note.placeholder}
            rows={6}
            className="w-full rounded-small border border-card-border bg-card p-3 text-base text-ink placeholder:text-ink-3"
          />
        </label>
        {error && (
          <Notice action={<Button variant="plain" onClick={save}>{t.common.retry}</Button>}>{error}</Notice>
        )}
      </div>
    </Dialog>
  );
}
