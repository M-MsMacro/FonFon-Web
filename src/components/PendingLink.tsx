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
import { BackLink } from "./Rows";
import { Button, GroupedCard, Notice, SectionHeader } from "./ui";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 text-sm">
      <dt className="text-ink-2">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

export function PendingLink({ child }: { child: Child }) {
  const router = useRouter();
  const refresh = useRefreshChildren();
  const [busy, setBusy] = useState(false);
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

  return (
    <div className="space-y-6">
      <BackLink href="/pro" label={t.patients.backToList} />
      <h1 className="font-brand text-3xl">{child.name}</h1>

      <section>
        <SectionHeader title={t.pending.banner} />
        <GroupedCard>
          <dl className="divide-y divide-separator">
            <Row label={t.pending.age} value={age} />
            <Row label={t.pending.guardian} value={request.guardianName} />
            <Row label={t.pending.appleAccount} value={request.maskedAccount ?? "—"} />
            <Row label={t.pending.sentAt} value={requestStamp(request.sentAt)} />
          </dl>
        </GroupedCard>
      </section>

      {error && <Notice>{error}</Notice>}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="destructive" onClick={() => decide(false)} disabled={busy}>
          {t.pending.decline}
        </Button>
        <Button onClick={() => decide(true)} disabled={busy}>
          {t.pending.approve}
        </Button>
      </div>
    </div>
  );
}
