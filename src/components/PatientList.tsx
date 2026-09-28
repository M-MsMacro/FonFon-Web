"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { deleteChild } from "@/lib/api";
import { startOfWeek } from "@/lib/calendar";
import { messageFor } from "@/lib/errors";
import { requestStamp } from "@/lib/format";
import { useChildren, useProfile, useWeek } from "@/lib/hooks";
import { t } from "@/lib/strings";
import type { Child } from "@/lib/types";
import { CodeCard } from "./QrCode";
import { Dialog } from "./Dialog";
import { ChevronIcon, ClockIcon, PeopleIcon, SearchIcon, TrashIcon, WifiOffIcon } from "./icons";
import { Button, Card, EmptyState, Loading, Notice, SectionHeader, StatusChip, cx } from "./ui";

const fold = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function PatientRow({ child, selected, onRemove }: { child: Child; selected: boolean; onRemove: () => void }) {
  const active = child.link.status === "active";
  const { data: week } = useWeek(child.id, startOfWeek(), active);
  const hasPrescription = child.prescriptions.length > 0;
  const minutes = week?.days.reduce((sum, day) => sum + day.activeMinutes, 0) ?? 0;
  const unfinished = week?.days.reduce((sum, day) => sum + day.unfinished, 0) ?? 0;

  const subtitle = !hasPrescription
    ? t.status.noPrescription
    : !week
      ? ""
      : minutes === 0
        ? t.patient.noPracticeThisWeek
        : t.patient.minutesThisWeek(minutes);

  let chip: React.ReactNode = null;
  if (!hasPrescription) chip = <StatusChip text={t.patient.newPatient} tone="neutral" uppercase />;
  else if (week && minutes > 0 && unfinished === 0) chip = <StatusChip text={t.patient.onTrack} tone="done" check uppercase />;
  else if (week) chip = <StatusChip text={t.patient.needsEncouragement} tone="pending" uppercase />;

  return (
    <li className="flex items-stretch gap-1">
      <Link
        href={`/pro/pacientes/${child.id}`}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "flex min-h-16 min-w-0 flex-1 items-center gap-2 rounded-medium border bg-card px-4 py-3 hover:bg-sunken",
          selected ? "border-accent" : "border-card-border",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-semibold">{child.name}</span>
            {chip}
          </span>
          <span className="block text-sm text-ink-2">{subtitle}</span>
        </span>
        <ChevronIcon className="size-4 shrink-0 text-ink-3" />
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${t.patients.remove} ${child.name}`}
        className="inline-flex w-11 shrink-0 items-center justify-center rounded-medium text-ink-2 hover:bg-alert-soft hover:text-alert"
      >
        <TrashIcon className="size-5" />
      </button>
    </li>
  );
}

export function PatientList() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: children, error, isLoading, mutate } = useChildren();
  const { data: profile } = useProfile();
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<Child | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const all = children ?? [];
  const pending = all.filter((child) => child.link.status === "pending");
  const needle = fold(query.trim());
  const results = all.filter(
    (child) => child.link.status !== "pending" && (!needle || fold(child.name).includes(needle)),
  );
  const isEmpty = !isLoading && !error && all.length === 0;

  async function confirmRemove() {
    if (!removing) return;
    setBusy(true);
    setRemoveError(null);
    try {
      await deleteChild(removing.id);
      await mutate();
      if (pathname.includes(removing.id)) router.push("/pro");
      setRemoving(null);
    } catch (failure) {
      setRemoveError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="font-brand text-3xl">{t.patients.title}</h1>

      {error && !children && (
        <Notice action={<Button variant="plain" onClick={() => mutate()}>{t.common.retry}</Button>}>
          <WifiOffIcon className="mr-1 inline size-4" />
          {messageFor(error)}
        </Notice>
      )}

      {pending.length > 0 && (
        <Link
          href={`/pro/pacientes/${pending[0].id}`}
          className="flex items-center gap-3 rounded-medium border border-card-border bg-card p-3 hover:bg-sunken"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
            <ClockIcon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{t.patients.pendingRequests(pending.length)}</span>
            {pending[0].link.status === "pending" && (
              <span className="block truncate text-xs text-ink-2">
                {pending[0].name} · {requestStamp(pending[0].link.sentAt)}
              </span>
            )}
          </span>
          <ChevronIcon className="size-4 text-ink-3" />
        </Link>
      )}

      {!isEmpty && (
        <label className="relative block">
          <span className="sr-only">{t.patients.search}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.patients.search}
            className="min-h-11 w-full rounded-full border border-card-border bg-card pl-9 pr-3 text-base placeholder:text-ink-3"
          />
        </label>
      )}

      {isLoading && !children && <Loading label={t.common.loading} />}

      {children && !isEmpty && (
        <section>
          <SectionHeader title={t.patients.count(results.length)} />
          {results.length === 0 ? (
            <EmptyState icon={<SearchIcon className="size-6" />} message={t.patients.noSearchResults} />
          ) : (
            <ul className="space-y-2">
              {results.map((child) => (
                <PatientRow
                  key={child.id}
                  child={child}
                  selected={pathname.startsWith(`/pro/pacientes/${child.id}`)}
                  onRemove={() => {
                    setRemoveError(null);
                    setRemoving(child);
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {isEmpty && (
        <Card className="space-y-4">
          <EmptyState icon={<PeopleIcon className="size-7" />} message={t.patients.empty} />
          {profile?.code && <CodeCard code={profile.code} />}
        </Card>
      )}

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={removing ? t.patients.removeTitle(removing.name) : ""}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={busy}>
              {t.patients.remove}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-2">{t.patients.removeBody}</p>
          {removeError && <Notice>{removeError}</Notice>}
        </div>
      </Dialog>
    </div>
  );
}
