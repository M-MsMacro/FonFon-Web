"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { deleteChild } from "@/lib/api";
import { messageFor } from "@/lib/errors";
import { requestStamp } from "@/lib/format";
import { useChildren, useProfile, useWeeks } from "@/lib/hooks";
import { FILTERS, matchesFilter, patientStatus, weekTotals, type Filter, type PatientStatus } from "@/lib/status";
import { t } from "@/lib/strings";
import type { Child, WeekMetrics } from "@/lib/types";
import { CodeCard } from "./QrCode";
import { Dialog } from "./Dialog";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  GearIcon,
  PeopleIcon,
  SearchIcon,
  SparkleIcon,
  TrashIcon,
  WifiOffIcon,
} from "./icons";
import { Avatar, Button, EmptyState, Loading, Notice, cx, initialsOf } from "./ui";

const fold = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const filterLabel: Record<Filter, string> = {
  all: t.desktop.filterAll,
  attention: t.desktop.filterAttention,
  onTrack: t.desktop.filterOnTrack,
  new: t.desktop.filterNew,
  requests: t.desktop.filterRequests,
};

export function StatusIcon({ status, className }: { status: PatientStatus; className?: string }) {
  if (status === "attention") return <AlertCircleIcon className={cx("text-attention", className)} />;
  if (status === "onTrack") return <CheckCircleIcon className={cx("text-done", className)} />;
  return <SparkleIcon className={cx("text-new", className)} />;
}

function FilterIcon({ filter, className }: { filter: Filter; className?: string }) {
  if (filter === "all") return <PeopleIcon className={className} />;
  if (filter === "attention") return <AlertCircleIcon className={className} />;
  if (filter === "onTrack") return <CheckCircleIcon className={className} />;
  if (filter === "new") return <SparkleIcon className={className} />;
  return <ClockIcon className={className} />;
}

function SidebarHeader({ children }: { children: ReactNode }) {
  return <h2 className="px-3 pb-1 pt-4 text-xs font-semibold text-ink-2">{children}</h2>;
}

function subtitleFor(child: Child, week: WeekMetrics | undefined) {
  if (child.link.status === "pending") return t.desktop.filterRequests;
  if (child.prescriptions.length === 0) return t.status.noPrescription;
  if (!week) return "";
  const { minutes } = weekTotals(week);
  return minutes === 0 ? t.patient.noPracticeThisWeek : t.patient.minutesThisWeek(minutes);
}

function PatientRow({
  child,
  week,
  selected,
  onRemove,
}: {
  child: Child;
  week: WeekMetrics | undefined;
  selected: boolean;
  onRemove: () => void;
}) {
  const status = patientStatus(child, week);
  return (
    <li className="group relative">
      <Link
        href={`/pro/pacientes/${child.id}`}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "flex min-h-12 items-center gap-2 rounded-[10px] border px-2 py-1.5",
          selected ? "border-accent bg-accent/15" : "border-transparent hover:bg-ink/5",
        )}
      >
        <Avatar initials={initialsOf(child.name)} size={30} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] leading-tight">{child.name}</span>
          <span className="block truncate text-xs leading-tight text-ink-2">{subtitleFor(child, week)}</span>
        </span>
        {status && <StatusIcon status={status} className="size-[18px] shrink-0" />}
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${t.patients.remove} ${child.name}`}
        className="absolute right-1 top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-card text-ink-2 hover:bg-alert-soft hover:text-alert focus-visible:inline-flex group-hover:inline-flex"
      >
        <TrashIcon className="size-4" />
      </button>
    </li>
  );
}

export function PatientList() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: children, error, isLoading, mutate } = useChildren();
  const { data: profile } = useProfile();
  const { data: weeks } = useWeeks(children);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [removing, setRemoving] = useState<Child | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const all = children ?? [];
  const needle = fold(query.trim());
  const visible = all.filter(
    (child) => matchesFilter(filter, child, weeks?.[child.id]) && (!needle || fold(child.name).includes(needle)),
  );
  const count = (item: Filter) => all.filter((child) => matchesFilter(item, child, weeks?.[child.id])).length;
  const isEmpty = !isLoading && !error && all.length === 0;
  const firstVisible = visible[0]?.id;

  useEffect(() => {
    if (pathname !== "/pro" || !firstVisible) return;
    if (window.matchMedia("(min-width: 1024px)").matches) router.replace(`/pro/pacientes/${firstVisible}`);
  }, [pathname, firstVisible, router]);

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
    <div className="flex h-full min-h-0 flex-col">
      <div className="p-3 pb-1">
        <label className="relative block">
          <span className="sr-only">{t.patients.search}</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.patients.search}
            className="min-h-9 w-full rounded-full bg-ink/8 pl-9 pr-3 text-[15px] placeholder:text-ink-2"
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {error && !children && (
          <div className="px-1 pt-3">
            <Notice action={<Button variant="plain" className="min-h-8 px-0" onClick={() => mutate()}>{t.common.retry}</Button>}>
              <WifiOffIcon className="mr-1 inline size-4" />
              {messageFor(error)}
            </Notice>
          </div>
        )}

        <SidebarHeader>{t.desktop.patients}</SidebarHeader>
        <ul>
          {FILTERS.map((item) => (
            <li key={item}>
              <button
                type="button"
                aria-pressed={item === filter}
                onClick={() => setFilter(item)}
                className={cx(
                  "flex min-h-9 w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-[15px]",
                  item === filter ? "bg-ink/12" : "hover:bg-ink/5",
                )}
              >
                <FilterIcon filter={item} className="size-[18px] shrink-0 text-accent" />
                <span className="min-w-0 flex-1 truncate">{filterLabel[item]}</span>
                <span className="text-sm text-ink-2">{count(item)}</span>
              </button>
            </li>
          ))}
        </ul>

        <SidebarHeader>{t.desktop.children}</SidebarHeader>
        {isLoading && !children && <Loading label={t.common.loading} />}
        {isEmpty && (
          <div className="space-y-3 px-1">
            <EmptyState icon={<PeopleIcon className="size-7" />} message={t.patients.empty} />
            {profile?.code && <CodeCard code={profile.code} />}
          </div>
        )}
        {children && !isEmpty && visible.length === 0 && (
          <EmptyState icon={<SearchIcon className="size-6" />} message={t.patients.noSearchResults} />
        )}
        <ul className="space-y-0.5">
          {visible.map((child) => (
            <PatientRow
              key={child.id}
              child={child}
              week={weeks?.[child.id]}
              selected={pathname.startsWith(`/pro/pacientes/${child.id}`)}
              onRemove={() => {
                setRemoveError(null);
                setRemoving(child);
              }}
            />
          ))}
        </ul>
        {filter === "requests" && visible[0]?.link.status === "pending" && (
          <p className="px-3 pt-2 text-xs text-ink-2">{requestStamp(visible[0].link.sentAt)}</p>
        )}
      </nav>

      {profile && (
        <Link
          href="/pro/perfil"
          aria-label={t.desktop.account}
          className="flex items-center gap-2 border-t border-separator bg-page/80 px-3 py-2.5 hover:bg-ink/5"
        >
          <Avatar initials={initialsOf(profile.displayName)} size={28} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] leading-tight">{profile.displayName}</span>
            <span className="block truncate text-xs leading-tight text-ink-2">{profile.code}</span>
          </span>
          <GearIcon className="size-[18px] text-ink-2" />
        </Link>
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
