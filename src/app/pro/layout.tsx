"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PatientList } from "@/components/PatientList";
import { Avatar, Button, Loading, Notice, cx, initialsOf } from "@/components/ui";
import { bootstrapProfile } from "@/lib/api";
import { toApiError, messageFor } from "@/lib/errors";
import { useProfile, useSignOut } from "@/lib/hooks";
import { t } from "@/lib/strings";
import { supabase } from "@/lib/supabase/client";

export default function ProLayout({ children }: LayoutProps<"/pro">) {
  const router = useRouter();
  const pathname = usePathname();
  const signOut = useSignOut();
  const { data: profile, error, mutate } = useProfile();
  const bootstrapping = useRef(false);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    if (toApiError(error).code === "notSignedIn" && error) router.replace("/entrar");
  }, [error, router]);

  useEffect(() => {
    if (profile !== null || bootstrapping.current) return;
    bootstrapping.current = true;
    (async () => {
      try {
        const { data } = await supabase().auth.getUser();
        const user = data.user;
        if (!user) {
          router.replace("/entrar");
          return;
        }
        const email = user.email ?? "";
        const name = (user.user_metadata?.display_name as string | undefined) || email.split("@")[0];
        await bootstrapProfile(name, email);
        await mutate();
      } catch (failure) {
        setBootError(messageFor(failure));
      }
    })();
  }, [profile, mutate, router]);

  const onList = pathname === "/pro";
  const failure = bootError ?? (error && toApiError(error).code !== "notSignedIn" ? messageFor(error) : null);
  const wrongRole = profile && profile.role !== "therapist";

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-card-border bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/pro" className="flex items-center gap-2">
            <Image src="/fonfon-mascot.png" alt="" width={32} height={32} className="size-8 object-contain" priority />
            <span className="font-brand text-xl">{t.brand.name}</span>
          </Link>
          {profile && (
            <Link
              href="/pro/perfil"
              aria-label={t.profile.menu}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-sunken"
            >
              <Avatar initials={initialsOf(profile.displayName)} />
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {failure && (
          <div className="mb-4">
            <Notice>{failure}</Notice>
          </div>
        )}

        {wrongRole ? (
          <div className="space-y-4">
            <Notice>{t.failure.roleConflict}</Notice>
            <Button variant="secondary" onClick={signOut}>
              {t.auth.signOut}
            </Button>
          </div>
        ) : !profile ? (
          !failure && <Loading label={t.common.loading} />
        ) : (
          <div className="flex flex-1 gap-8">
            <aside className={cx("w-full lg:block lg:w-96 lg:shrink-0", onList ? "block" : "hidden")}>
              <PatientList />
            </aside>
            <section className={cx("min-w-0 flex-1", onList ? "hidden lg:block" : "block")}>{children}</section>
          </div>
        )}
      </div>
    </div>
  );
}
