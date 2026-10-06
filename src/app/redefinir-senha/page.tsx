"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button, Notice, TextField } from "@/components/ui";
import { t } from "@/lib/strings";
import { isConfigured, supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t.auth.weakPassword);
      return;
    }
    setBusy(true);
    const { error: failure } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (!failure) {
      setDone(true);
      return;
    }
    setError(failure.name === "AuthSessionMissingError" ? t.failure.notSignedIn : t.failure.generic);
  }

  return (
    <AuthShell title={t.auth.resetTitle}>
      {done ? (
        <div className="space-y-4">
          <Notice tone="done">{t.auth.resetDone}</Notice>
          <Link
            href="/fono"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 font-medium text-on-accent"
          >
            {t.patients.title}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!isConfigured && <Notice>{t.auth.notConfigured}</Notice>}
          <TextField
            label={t.auth.password}
            hint={t.auth.passwordHint}
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && (
            <Notice>
              {error}{" "}
              <Link href="/recuperar-senha" className="font-medium underline">
                {t.auth.forgot}
              </Link>
            </Notice>
          )}
          <Button type="submit" className="w-full" disabled={busy || !isConfigured}>
            {t.auth.savePassword}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
