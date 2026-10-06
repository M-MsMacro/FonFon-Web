"use client";

import { weekRange } from "@/lib/format";
import { sessionStamp } from "@/lib/format";
import { symbolFor } from "@/lib/phonemes";
import { t } from "@/lib/strings";
import type { PracticeDay, PracticeSession, Prescription, Stage, StageProgress } from "@/lib/types";
import { Dialog } from "./Dialog";
import { DownloadIcon, PrinterIcon } from "./icons";
import { LetterTile, StageTrack } from "./Phoneme";
import { WeekChart } from "./WeekChart";
import { Button } from "./ui";

type ReportData = {
  firstName: string;
  days: PracticeDay[];
  prescriptions: Prescription[];
  progress: Record<string, Record<Stage, StageProgress>> | undefined;
  sessions: PracticeSession[];
};

const averageOf = (total: number, count: number) => (count > 0 ? Math.round(total / count) : 0);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-deep">{title}</h3>
      {children}
    </section>
  );
}

function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="flex min-h-[72px] flex-1 flex-col items-center justify-center rounded-medium bg-accent-soft px-1 py-3 text-center">
      <p className="text-[22px] font-semibold">{value}</p>
      <p className="text-xs text-ink-2">{caption}</p>
    </div>
  );
}

export function ReportDialog({ open, onClose, data }: { open: boolean; onClose: () => void; data: ReportData }) {
  const totalMinutes = data.days.reduce((sum, day) => sum + day.activeMinutes, 0);
  const totalActivities = data.days.reduce((sum, day) => sum + day.activities, 0);
  const activeDays = data.days.filter((day) => day.activeMinutes > 0).length;
  const range = data.days.length > 0 ? weekRange(data.days[0].date, data.days[data.days.length - 1].date) : "";
  const completed = data.sessions
    .filter((session) => session.outcome === "completed")
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, 5);
  const inProgress = data.prescriptions.filter((item) => item.state === "active");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.report.title(data.firstName)}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <PrinterIcon className="size-4" />
            {t.report.print}
          </Button>
          <Button onClick={() => window.print()}>
            <DownloadIcon className="size-4" />
            {t.report.exportPdf}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            {t.common.close}
          </Button>
        </div>
      }
    >
      <div id="report" className="report-light space-y-5 rounded-medium p-6">
        <h2 className="text-2xl font-semibold">{t.report.title(data.firstName)}</h2>

        <div className="flex gap-2">
          <Stat value={`${averageOf(totalMinutes, activeDays)} min`} caption={t.report.averageActivity} />
          <Stat value={String(totalActivities)} caption={t.report.activities} />
          <Stat value={`${averageOf(totalMinutes, totalActivities)} min`} caption={t.report.averageTime} />
        </div>

        <Section title={t.report.activity}>
          {range && <p className="text-sm text-ink-2">{t.report.activityRange(range)}</p>}
          {data.days.length > 0 && <WeekChart days={data.days} height={140} />}
        </Section>

        {inProgress.length > 0 && (
          <Section title={t.report.phonemesInProgress}>
            <div className="space-y-3">
              {inProgress.map((item) => (
                <div key={item.phonemeKey} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LetterTile phonemeKey={item.phonemeKey} size={38} />
                    <span className="font-semibold">{symbolFor(item.phonemeKey)}</span>
                  </div>
                  <StageTrack progress={data.progress?.[item.phonemeKey]} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {completed.length > 0 && (
          <Section title={t.report.completedSessions}>
            <div className="space-y-3">
              {completed.map((session) => (
                <div key={session.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {t.stage[session.stage]} · {symbolFor(session.phonemeKey)}
                    </p>
                    <p className="text-sm text-ink-2">{sessionStamp(session.startedAt, session.minutes)}</p>
                  </div>
                  <span className="rounded-full bg-done-soft px-2 py-0.5 text-xs font-semibold text-done">
                    {t.detail.sessionDone}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <p className="pt-2 text-center text-[11px] text-ink-2">{t.report.footer}</p>
      </div>
    </Dialog>
  );
}
