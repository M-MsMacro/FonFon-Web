import { isSameDay } from "./calendar";
import type { PhonemeActivity, PracticeSession, Stage } from "./types";

export function activityForDay(sessions: PracticeSession[], day: Date): PhonemeActivity[] {
  const byPhoneme = new Map<string, PracticeSession[]>();
  for (const session of sessions) {
    if (!isSameDay(session.startedAt, day)) continue;
    byPhoneme.set(session.phonemeKey, [...(byPhoneme.get(session.phonemeKey) ?? []), session]);
  }

  return [...byPhoneme]
    .map(([phonemeKey, list]) => {
      const stageMinutes: Partial<Record<Stage, number>> = {};
      for (const session of list) {
        stageMinutes[session.stage] = (stageMinutes[session.stage] ?? 0) + session.minutes;
      }
      const unfinished = list.filter((session) => session.outcome === "abandoned");
      return {
        phonemeKey,
        totalMinutes: Object.values(stageMinutes).reduce((sum, minutes) => sum + minutes, 0),
        stageMinutes,
        unfinishedStage: unfinished[0]?.stage ?? null,
        unfinishedCount: unfinished.length,
      };
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
