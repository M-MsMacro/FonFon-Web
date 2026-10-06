import { dayString, parseDay } from "./calendar";
import { toApiError } from "./errors";
import { supabase } from "./supabase/client";
import {
  STAGES,
  type Child,
  type ClinicalNote,
  type Link,
  type PhonemeActivity,
  type PracticeSession,
  type PrescriptionItem,
  type Profile,
  type Stage,
  type StageProgress,
  type WeekMetrics,
} from "./types";

type RawPrescription = {
  phoneme_key: string;
  state: "active" | "completed";
  since: string;
  completed_on: string | null;
};

type RawLink =
  | { status: "unlinked" }
  | {
      status: "pending";
      guardian_name: string;
      masked_apple_account: string | null;
      sent_at: string;
      matches: boolean;
    }
  | { status: "active"; guardian_name: string };

type RawChild = {
  id: string;
  name: string | null;
  birth_date: string | null;
  guardian_name: string | null;
  link?: RawLink;
  prescriptions?: RawPrescription[];
};

type RawWeek = {
  week_start: string;
  days: { date: string; active_minutes: number; activities: number; unfinished: number }[] | null;
  phoneme_activity: {
    phoneme_key: string;
    total_minutes: number;
    stage_minutes: Record<string, number>;
    unfinished_stage: string | null;
    unfinished_count: number;
  }[];
  progress: Record<string, Partial<Record<Stage, StageProgress>>>;
};

type RawSession = {
  id: string;
  phoneme_key: string;
  stage: Stage;
  started_at: string;
  active_seconds: number;
  outcome: "completed" | "abandoned";
};

const isStage = (value: string): value is Stage => (STAGES as readonly string[]).includes(value);

function mapLink(raw: RawLink | undefined): Link {
  if (raw?.status === "pending") {
    return {
      status: "pending",
      guardianName: raw.guardian_name,
      maskedAccount: raw.masked_apple_account,
      sentAt: new Date(raw.sent_at),
      matches: raw.matches,
    };
  }
  if (raw?.status === "active") return { status: "active", guardianName: raw.guardian_name };
  return { status: "unlinked" };
}

export function mapChild(raw: RawChild): Child | null {
  const link = mapLink(raw.link);
  if (!raw.name || !raw.birth_date || link.status === "unlinked") return null;
  return {
    id: raw.id,
    name: raw.name,
    birthDate: parseDay(raw.birth_date),
    guardianName: raw.guardian_name,
    link,
    prescriptions: (raw.prescriptions ?? []).map((item) => ({
      phonemeKey: item.phoneme_key,
      state: item.state,
      since: new Date(item.since),
      completedOn: item.completed_on ? new Date(item.completed_on) : null,
    })),
  };
}

export function mapWeek(raw: RawWeek): WeekMetrics {
  const phonemeActivity: PhonemeActivity[] = raw.phoneme_activity.map((item) => ({
    phonemeKey: item.phoneme_key,
    totalMinutes: item.total_minutes,
    stageMinutes: Object.fromEntries(
      Object.entries(item.stage_minutes).filter(([stage]) => isStage(stage)),
    ),
    unfinishedStage: item.unfinished_stage && isStage(item.unfinished_stage) ? item.unfinished_stage : null,
    unfinishedCount: item.unfinished_count,
  }));

  const progress = Object.fromEntries(
    Object.entries(raw.progress).map(([key, stages]) => [
      key,
      Object.fromEntries(STAGES.map((stage) => [stage, stages[stage] ?? "notStarted"])),
    ]),
  ) as WeekMetrics["progress"];

  return {
    weekStart: parseDay(raw.week_start),
    days: (raw.days ?? []).map((day) => ({
      date: parseDay(day.date),
      activeMinutes: day.active_minutes,
      activities: day.activities,
      unfinished: day.unfinished,
    })),
    phonemeActivity,
    progress,
  };
}

export function mapSession(raw: RawSession): PracticeSession {
  return {
    id: raw.id,
    phonemeKey: raw.phoneme_key,
    stage: raw.stage,
    startedAt: new Date(raw.started_at),
    minutes: Math.round(raw.active_seconds / 60),
    outcome: raw.outcome,
  };
}

async function rpc<T>(name: string, params?: object): Promise<T> {
  const { data, error } = await supabase().rpc(name, params);
  if (error) throw toApiError(error);
  return data as T;
}

export async function bootstrapProfile(displayName: string, email: string | null): Promise<Profile> {
  const raw = await rpc<{ id: string; role: Profile["role"]; display_name: string; code: string | null; email: string | null }>(
    "bootstrap_profile",
    { p_role: "therapist", p_display_name: displayName, p_email: email },
  );
  return { id: raw.id, role: raw.role, displayName: raw.display_name, code: raw.code, email: raw.email };
}

export async function myProfile(): Promise<Profile | null> {
  const { data: sessionData } = await supabase().auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw toApiError({ message: "not_authenticated" });
  const { data, error } = await supabase()
    .from("profiles")
    .select("id,role,display_name,code,email")
    .eq("id", userId)
    .limit(1);
  if (error) throw toApiError(error);
  const row = data?.[0];
  return row
    ? { id: row.id, role: row.role, displayName: row.display_name, code: row.code, email: row.email }
    : null;
}

export async function listChildren(): Promise<Child[]> {
  const page = await rpc<{ children: RawChild[] }>("children_with_link", { p_since: null });
  return page.children.map(mapChild).filter((child): child is Child => child !== null);
}

export async function decideLink(childId: string, approve: boolean): Promise<Child | null> {
  return mapChild(await rpc<RawChild>("decide_link", { p_child_id: childId, p_approve: approve }));
}

export async function deleteChild(childId: string): Promise<void> {
  await rpc<null>("delete_child", { p_child_id: childId });
}

export async function setPrescription(childId: string, items: PrescriptionItem[]): Promise<Child | null> {
  const payload = items.map((item) => ({ phoneme_key: item.phonemeKey, state: item.state }));
  return mapChild(await rpc<RawChild>("set_prescription", { p_child_id: childId, p_items: payload }));
}

export async function weekMetrics(childId: string, weekStart: Date, timeZone: string): Promise<WeekMetrics> {
  return mapWeek(
    await rpc<RawWeek>("week_metrics", {
      p_child_id: childId,
      p_week_start: dayString(weekStart),
      p_tz: timeZone,
    }),
  );
}

export async function listSessions(childId: string, before: Date | null, limit: number): Promise<PracticeSession[]> {
  let query = supabase()
    .from("practice_sessions")
    .select("id,phoneme_key,stage,started_at,active_seconds,outcome")
    .eq("child_id", childId);
  if (before) query = query.lt("started_at", before.toISOString());
  const { data, error } = await query.order("started_at", { ascending: false }).limit(limit);
  if (error) throw toApiError(error);
  return (data as RawSession[]).map(mapSession);
}

export async function listSessionsBetween(childId: string, from: Date, to: Date): Promise<PracticeSession[]> {
  const { data, error } = await supabase()
    .from("practice_sessions")
    .select("id,phoneme_key,stage,started_at,active_seconds,outcome")
    .eq("child_id", childId)
    .gte("started_at", from.toISOString())
    .lt("started_at", to.toISOString())
    .order("started_at", { ascending: false })
    .limit(500);
  if (error) throw toApiError(error);
  return (data as RawSession[]).map(mapSession);
}

export async function listNotes(childId: string): Promise<ClinicalNote[]> {
  const { data, error } = await supabase()
    .from("clinical_notes")
    .select("id,text,created_at")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  if (error) throw toApiError(error);
  return data.map((row) => ({ id: row.id, text: row.text, createdAt: new Date(row.created_at) }));
}

export async function addNote(childId: string, text: string): Promise<ClinicalNote> {
  const { data: sessionData } = await supabase().auth.getSession();
  const therapistId = sessionData.session?.user.id;
  if (!therapistId) throw toApiError({ message: "not_authenticated" });
  const { data, error } = await supabase()
    .from("clinical_notes")
    .insert({ child_id: childId, therapist_id: therapistId, text })
    .select("id,text,created_at")
    .single();
  if (error) throw toApiError(error);
  return { id: data.id, text: data.text, createdAt: new Date(data.created_at) };
}
