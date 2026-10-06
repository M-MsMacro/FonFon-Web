"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { decideLink } from "@/lib/api";
import { ageInYears } from "@/lib/calendar";
import { messageFor } from "@/lib/errors";
import { numericDate, requestStamp } from "@/lib/format";
import { useRefreshChildren } from "@/lib/hooks";
import { t } from "@/lib/strings";
import type { Child } from "@/lib/types";
import { ClockIcon } from "./icons";
import { BackLink } from "./Rows";
import { Avatar, Button, Notice, SurfaceCard, initialsOf } from "./ui";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 text-[15px]">
      <dt>{label}</dt>
      <dd className="text-right text-ink-2">{value}</dd>
    </div>
  );
}

export function PendingLink({ child }: { child: Child }) {
  const router = useRouter();
  const refresh = useRefreshChildren();
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (child.link.status !== "pending") return null;
  const request = child.link;
  const age = `${t.patient.age(ageInYears(child.birthDate))} · ${t.pending.birth(numericDate(child.birthDate))}`;

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      await decideLink(child.id, approve);
      await refresh();
      if (!approve) router.push("/pro");
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  const option = (value: boolean, label: string) => (
    <label className="flex min-h-9 cursor-pointer items-center gap-2 text-[15px]">
      <input
        type="radio"
        name="matches"
        checked={matches === value}
        onChange={() => setMatches(value)}
        className="size-4 accent-[var(--accent)]"
      />
      {label}
    </label>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex min-h-14 items-center gap-3 border-b border-separator bg-page/85 px-6 py-2 backdrop-blur">
        <BackLink href="/pro" label={t.patients.backToList} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight">{child.name}</h1>
          <p className="truncate text-xs leading-tight text-ink-2">
            {t.desktop.filterRequests} · {requestStamp(request.sentAt)}
          </p>
        </div>
        <Button variant="destructive" className="min-h-8 px-4 text-sm" onClick={() => decide(false)} disabled={busy}>
          {t.pending.decline}
        </Button>
        <Button className="min-h-8 px-4 text-sm" onClick={() => decide(true)} disabled={busy || !matches}>
          {t.pending.approve}
        </Button>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
        <SurfaceCard className="flex items-center gap-3">
          <Avatar initials={initialsOf(child.name)} size={56} />
          <div>
            <p className="text-xl font-semibold">{child.name}</p>
            <p className="inline-flex items-center gap-1 text-[15px] text-pending">
              <ClockIcon className="size-4" />
              {t.pending.banner}
            </p>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <dl className="divide-y divide-separator">
            <Row label={t.pending.age} value={age} />
            <Row label={t.pending.guardian} value={request.guardianName} />
            <Row label={t.pending.appleAccount} value={request.maskedAccount ?? "—"} />
            <Row label={t.pending.sentAt} value={requestStamp(request.sentAt)} />
          </dl>
        </SurfaceCard>

        <SurfaceCard className="space-y-1">
          <p className="text-[15px]">{t.desktop.confirmQuestion}</p>
          <div role="radiogroup" className="pt-1">
            {option(true, t.desktop.dataMatches)}
            {option(false, t.desktop.dataDiffers)}
          </div>
        </SurfaceCard>

        {error && <Notice>{error}</Notice>}
      </div>
    </div>
  );
}
