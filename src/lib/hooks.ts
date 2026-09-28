"use client";

import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import {
  listChildren,
  listNotes,
  listSessions,
  listSessionsBetween,
  myProfile,
  weekMetrics,
} from "./api";
import { addDays, dayString } from "./calendar";
import { supabase } from "./supabase/client";
import type { Child } from "./types";

const REFRESH_MS = 60_000;

export const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function useProfile() {
  return useSWR("profile", myProfile, { revalidateOnFocus: false });
}

export function useChildren() {
  return useSWR("children", listChildren, { refreshInterval: REFRESH_MS, revalidateOnFocus: true });
}

export function useChild(id: string): { child: Child | undefined; isLoading: boolean; error: unknown } {
  const { data, isLoading, error } = useChildren();
  return { child: data?.find((item) => item.id === id), isLoading, error };
}

export function useWeek(childId: string, weekStart: Date, enabled: boolean) {
  return useSWR(
    enabled ? ["week", childId, dayString(weekStart)] : null,
    () => weekMetrics(childId, weekStart, timeZone()),
    { refreshInterval: REFRESH_MS, revalidateOnFocus: true, keepPreviousData: true },
  );
}

export function useNotes(childId: string) {
  return useSWR(["notes", childId], () => listNotes(childId));
}

export function useRecentSessions(childId: string, enabled: boolean, limit = 5) {
  return useSWR(
    enabled ? ["sessions", childId, limit] : null,
    () => listSessions(childId, null, limit),
    { refreshInterval: REFRESH_MS, revalidateOnFocus: true },
  );
}

export function useWeekSessions(childId: string, weekStart: Date, enabled: boolean) {
  return useSWR(
    enabled ? ["week-sessions", childId, dayString(weekStart)] : null,
    () => listSessionsBetween(childId, weekStart, addDays(weekStart, 7)),
    { keepPreviousData: true },
  );
}

export function useSignOut() {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  return async () => {
    await supabase().auth.signOut();
    await mutate(() => true, undefined, { revalidate: false });
    router.replace("/entrar");
    router.refresh();
  };
}

export const SESSIONS_PAGE = 30;

export function useAllSessions(childId: string) {
  return useSWRInfinite(
    (index, previous) => {
      if (previous && previous.length < SESSIONS_PAGE) return null;
      const before = previous?.at(-1)?.startedAt.toISOString() ?? null;
      return ["all-sessions", childId, index, before];
    },
    async ([, id, , before]) =>
      listSessions(id as string, before ? new Date(before as string) : null, SESSIONS_PAGE),
    { revalidateFirstPage: false },
  );
}

export function useRefreshChildren() {
  const { mutate } = useSWRConfig();
  return () => mutate("children");
}
