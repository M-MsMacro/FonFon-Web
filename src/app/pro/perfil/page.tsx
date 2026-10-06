"use client";

import { useState } from "react";
import { Dialog } from "@/components/Dialog";
import { ExitIcon } from "@/components/icons";
import { CodeCard } from "@/components/QrCode";
import { BackLink } from "@/components/Rows";
import { Avatar, Button, Card, Loading, SectionHeader, initialsOf } from "@/components/ui";
import { useProfile, useSignOut } from "@/lib/hooks";
import { t } from "@/lib/strings";

export default function ProfilePage() {
  const { data: profile } = useProfile();
  const signOut = useSignOut();
  const [confirming, setConfirming] = useState(false);

  if (!profile) return <Loading label={t.common.loading} />;

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <BackLink href="/pro" label={t.patients.backToList} always />

      <div className="flex flex-col items-center gap-3">
        <Avatar initials={initialsOf(profile.displayName)} size={100} />
        <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
        {profile.email && <p className="text-sm text-ink-2">{profile.email}</p>}
      </div>

      {profile.code && (
        <section>
          <SectionHeader title={t.code.section} />
          <Card>
            <CodeCard code={profile.code} />
          </Card>
        </section>
      )}

      <Button variant="destructive" className="w-full" onClick={() => setConfirming(true)}>
        <ExitIcon className="size-4" />
        {t.auth.signOut}
      </Button>

      {confirming && (
        <Dialog
          open
          onClose={() => setConfirming(false)}
          title={t.auth.signOutTitle}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirming(false)}>
                {t.common.cancel}
              </Button>
              <Button variant="destructive" onClick={signOut}>
                {t.auth.signOut}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-ink-2">{t.auth.sharedComputer}</p>
        </Dialog>
      )}
    </div>
  );
}
