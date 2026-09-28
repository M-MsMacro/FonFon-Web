import { describe, expect, it } from "vitest";
import { activityForDay } from "./activity";
import type { PracticeSession } from "./types";

const session = (overrides: Partial<PracticeSession>): PracticeSession => ({
  id: crypto.randomUUID(),
  phonemeKey: "sapo",
  stage: "word",
  startedAt: new Date(2026, 8, 28, 18, 0),
  minutes: 4,
  outcome: "completed",
  ...overrides,
});

describe("activityForDay", () => {
  it("sums minutes per stage and counts abandoned sessions for one day", () => {
    const day = new Date(2026, 8, 28);
    const result = activityForDay(
      [
        session({ stage: "warmup", minutes: 3 }),
        session({ stage: "word", minutes: 5, outcome: "abandoned" }),
        session({ stage: "word", minutes: 2 }),
        session({ startedAt: new Date(2026, 8, 27, 18, 0), minutes: 9 }),
      ],
      day,
    );
    expect(result).toEqual([
      {
        phonemeKey: "sapo",
        totalMinutes: 10,
        stageMinutes: { warmup: 3, word: 7 },
        unfinishedStage: "word",
        unfinishedCount: 1,
      },
    ]);
  });

  it("orders phonemes by total minutes, largest first", () => {
    const day = new Date(2026, 8, 28);
    const result = activityForDay(
      [session({ phonemeKey: "gato", minutes: 2 }), session({ phonemeKey: "zebra", minutes: 8 })],
      day,
    );
    expect(result.map((item) => item.phonemeKey)).toEqual(["zebra", "gato"]);
  });

  it("returns nothing for a day without sessions", () => {
    expect(activityForDay([session({})], new Date(2026, 8, 20))).toEqual([]);
  });
});
