export type Stage = "warmup" | "phoneme" | "syllable" | "word";

export const STAGES: readonly Stage[] = ["warmup", "phoneme", "syllable", "word"];

export type StageProgress = "completed" | "inProgress" | "notStarted";

export type PrescriptionState = "active" | "completed";

export type Prescription = {
  phonemeKey: string;
  state: PrescriptionState;
  since: Date;
  completedOn: Date | null;
};

export type Link =
  | { status: "unlinked" }
  | {
      status: "pending";
      guardianName: string;
      maskedAccount: string | null;
      sentAt: Date;
      matches: boolean;
    }
  | { status: "active"; guardianName: string };

export type Child = {
  id: string;
  name: string;
  birthDate: Date;
  guardianName: string | null;
  link: Link;
  prescriptions: Prescription[];
};

export type Profile = {
  id: string;
  role: "therapist" | "guardian";
  displayName: string;
  code: string | null;
  email: string | null;
};

export type PracticeDay = {
  date: Date;
  activeMinutes: number;
  activities: number;
  unfinished: number;
};

export type PhonemeActivity = {
  phonemeKey: string;
  totalMinutes: number;
  stageMinutes: Partial<Record<Stage, number>>;
  unfinishedStage: Stage | null;
  unfinishedCount: number;
};

export type WeekMetrics = {
  weekStart: Date;
  days: PracticeDay[];
  phonemeActivity: PhonemeActivity[];
  progress: Record<string, Record<Stage, StageProgress>>;
};

export type SessionOutcome = "completed" | "abandoned";

export type PracticeSession = {
  id: string;
  phonemeKey: string;
  stage: Stage;
  startedAt: Date;
  minutes: number;
  outcome: SessionOutcome;
};

export type ClinicalNote = { id: string; text: string; createdAt: Date };

export type PrescriptionItem = { phonemeKey: string; state: PrescriptionState };
