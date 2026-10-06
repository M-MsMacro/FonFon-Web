"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button, Notice, TextField } from "@/components/ui";
import { t } from "@/lib/strings";
import { isConfigured, supabase } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t.auth.weakPassword);
      return;
    }
    setBusy(true);
    const { data, error: failure } = await supabase().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/fono`,
      },
    });
    setBusy(false);

    if (failure) {
      setError(failure.code === "weak_password" ? t.auth.weakPassword : t.failure.generic);
      return;
    }
    if (data.user && data.user.identities?.length === 0) {
      setError(t.auth.alreadyRegistered);
      return;
    }
    if (data.session) {
      router.replace("/fono");
      router.refresh();
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        title={t.auth.checkEmailTitle}
        footer={
          <Link href="/entrar" className="font-medium text-accent hover:underline">
            {t.auth.goSignIn}
          </Link>
        }
      >
        <p className="text-ink-2">{t.auth.checkEmailBody}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t.auth.signUpTitle}
      footer={
        <Link href="/entrar" className="font-medium text-accent hover:underline">
          {t.auth.goSignIn}
        </Link>
      }
    >
      {!isConfigured && <Notice>{t.auth.notConfigured}</Notice>}
      <form onSubmit={submit} className="space-y-4">
        <TextField
          label={t.auth.name}
          autoComplete="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label={t.auth.email}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
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
        {error && <Notice>{error}</Notice>}
        <Button type="submit" className="w-full" disabled={busy || !isConfigured}>
          {t.auth.signUp}
        </Button>
      </form>
    </AuthShell>
  );
}
