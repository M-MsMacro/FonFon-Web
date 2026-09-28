"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button, Notice, TextField } from "@/components/ui";
import { t } from "@/lib/strings";
import { isConfigured, supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: failure } = await supabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setBusy(false);
    if (failure && failure.status !== 400 && failure.status !== 422) {
      setError(t.failure.generic);
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title={t.auth.forgotTitle}
      footer={
        <Link href="/entrar" className="font-medium text-accent hover:underline">
          {t.auth.goSignIn}
        </Link>
      }
    >
      {sent ? (
        <Notice tone="done">{t.auth.resetSentBody}</Notice>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!isConfigured && <Notice>{t.auth.notConfigured}</Notice>}
          <TextField
            label={t.auth.email}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && <Notice>{error}</Notice>}
          <Button type="submit" className="w-full" disabled={busy || !isConfigured}>
            {t.auth.sendLink}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
