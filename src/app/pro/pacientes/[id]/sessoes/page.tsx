"use client";

import { useParams } from "next/navigation";
import { CalendarIcon } from "@/components/icons";
import { BackLink, SessionRow } from "@/components/Rows";
import { Button, EmptyState, GroupedCard, Loading, Notice } from "@/components/ui";
import { messageFor } from "@/lib/errors";
import { SESSIONS_PAGE, useAllSessions, useChild } from "@/lib/hooks";
import { t } from "@/lib/strings";

export default function AllSessionsPage() {
  const { id } = useParams<{ id: string }>();
  const { child } = useChild(id);
  const { data, error, size, setSize, isValidating, mutate } = useAllSessions(id);

  const sessions = data?.flat() ?? [];
  const hasMore = data !== undefined && data[data.length - 1].length === SESSIONS_PAGE;

  return (
    <div className="space-y-6">
      <BackLink href={`/pro/pacientes/${id}`} label={child?.name ?? t.patients.backToList} always />
      <h1 className="font-brand text-3xl">{t.allSessions.title}</h1>

      {error && (
        <Notice action={<Button variant="plain" onClick={() => mutate()}>{t.common.retry}</Button>}>
          {messageFor(error)}
        </Notice>
      )}

      {!data && !error && <Loading label={t.common.loading} />}

      {data && sessions.length === 0 && (
        <EmptyState icon={<CalendarIcon className="size-6" />} message={t.allSessions.empty} />
      )}

      {sessions.length > 0 && (
        <GroupedCard>
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </GroupedCard>
      )}

      {hasMore && (
        <Button variant="secondary" className="w-full" disabled={isValidating} onClick={() => setSize(size + 1)}>
          {t.allSessions.loadMore}
        </Button>
      )}
    </div>
  );
}
