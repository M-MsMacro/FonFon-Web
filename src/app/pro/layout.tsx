"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PatientList } from "@/components/PatientList";
import { Button, Loading, Notice, cx } from "@/components/ui";
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
          await signOut();
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
  }, [profile, mutate, signOut]);

  const onList = pathname === "/pro";
  const failure = bootError ?? (error && toApiError(error).code !== "notSignedIn" ? messageFor(error) : null);
  const wrongRole = profile && profile.role !== "therapist";

  return (
    <div className="flex min-h-dvh">
      {wrongRole || !profile ? (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-12">
          {failure && <Notice>{failure}</Notice>}
          {failure && !wrongRole && (
            <Button variant="secondary" onClick={signOut}>
              {t.auth.signOut}
            </Button>
          )}
          {wrongRole ? (
            <>
              <Notice>{t.failure.roleConflict}</Notice>
              <Button variant="secondary" onClick={signOut}>
                {t.auth.signOut}
              </Button>
            </>
          ) : (
            !failure && <Loading label={t.common.loading} />
          )}
        </div>
      ) : (
        <>
          <aside
            className={cx(
              "w-full flex-col bg-sunken lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[270px] lg:shrink-0 lg:border-r lg:border-separator",
              onList ? "flex" : "hidden",
            )}
          >
            <PatientList />
          </aside>
          <main className={cx("min-w-0 flex-1", onList ? "hidden lg:block" : "block")}>
            {failure && (
              <div className="p-4">
                <Notice>{failure}</Notice>
              </div>
            )}
            {children}
          </main>
        </>
      )}
    </div>
  );
}
