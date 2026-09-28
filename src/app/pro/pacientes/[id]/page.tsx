"use client";

import { useParams } from "next/navigation";
import { PatientDetail } from "@/components/PatientDetail";
import { PendingLink } from "@/components/PendingLink";
import { BackLink } from "@/components/Rows";
import { EmptyState, Loading } from "@/components/ui";
import { useChild } from "@/lib/hooks";
import { t } from "@/lib/strings";

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const { child, isLoading } = useChild(id);

  if (isLoading && !child) return <Loading label={t.common.loading} />;

  if (!child) {
    return (
      <div className="space-y-4">
        <BackLink href="/pro" label={t.patients.backToList} />
        <EmptyState message={t.patients.notFound} />
      </div>
    );
  }

  return child.link.status === "pending" ? <PendingLink child={child} /> : <PatientDetail child={child} />;
}
