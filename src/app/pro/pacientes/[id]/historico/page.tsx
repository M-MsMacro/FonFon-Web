"use client";

import { useParams } from "next/navigation";
import { PeopleIcon } from "@/components/icons";
import { BackLink, PrescriptionRow } from "@/components/Rows";
import { EmptyState, GroupedCard, Loading } from "@/components/ui";
import { startOfWeek } from "@/lib/calendar";
import { useChild, useWeek } from "@/lib/hooks";
import { t } from "@/lib/strings";

export default function PhonemeHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { child, isLoading } = useChild(id);
  const week = useWeek(id, startOfWeek(), child?.link.status === "active");

  const ordered = [...(child?.prescriptions ?? [])].sort(
    (a, b) => (b.completedOn ?? b.since).getTime() - (a.completedOn ?? a.since).getTime(),
  );

  return (
    <div className="space-y-6">
      <BackLink href={`/pro/pacientes/${id}`} label={child?.name ?? t.patients.backToList} always />
      <h1 className="font-brand text-3xl">{t.detail.historyTitle}</h1>

      {isLoading && !child && <Loading label={t.common.loading} />}

      {child && ordered.length === 0 && (
        <EmptyState icon={<PeopleIcon className="size-6" />} message={t.detail.historyEmpty} />
      )}

      {ordered.length > 0 && (
        <GroupedCard>
          {ordered.map((item) => (
            <PrescriptionRow key={item.phonemeKey} prescription={item} progress={week.data?.progress[item.phonemeKey]} />
          ))}
        </GroupedCard>
      )}
    </div>
  );
}
