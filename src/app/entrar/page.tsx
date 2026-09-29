"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button, Notice, TextField } from "@/components/ui";
import { safeNext } from "@/lib/redirect";
import { t } from "@/lib/strings";
import { isConfigured, supabase } from "@/lib/supabase/client";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("erro") === "apple" ? t.auth.appleSignInFailed : params.get("erro") === "link" ? t.auth.linkExpired : null,
  );
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setUnconfirmed(false);
    const { error: failure } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (!failure) {
      router.replace(safeNext(params.get("next")));
      router.refresh();
      return;
    }
    if (failure.code === "email_not_confirmed") {
      setUnconfirmed(true);
      setError(t.auth.emailNotConfirmed);
    } else if (failure.code === "invalid_credentials") {
      setError(t.auth.invalidCredentials);
    } else {
      setError(t.failure.generic);
    }
  }

  async function resend() {
    const { error: failure } = await supabase().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/pro` },
    });
    if (!failure) setResent(true);
  }

  async function signInWithApple() {
    setBusy(true);
    setError(null);
    const next = safeNext(params.get("next"));
    const { error: failure } = await supabase().auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/auth/callback?provider=apple&next=${encodeURIComponent(next)}` },
    });
    if (failure) {
      setError(t.auth.appleSignInFailed);
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={t.auth.signInTitle}
      footer={
        <>
          <p>
            <Link href="/criar-conta" className="font-medium text-accent hover:underline">
              {t.auth.goSignUp}
            </Link>
          </p>
          <p>{t.auth.sharedComputer}</p>
        </>
      }
    >
      {!isConfigured && <Notice>{t.auth.notConfigured}</Notice>}
      {error && <Notice>{error}</Notice>}
      <button type="button" className="flex w-full justify-center disabled:cursor-not-allowed disabled:opacity-50" disabled={busy || !isConfigured} onClick={signInWithApple}>
        <Image
          unoptimized
          src="https://appleid.cdn-apple.com/appleid/button?type=continue&color=black&border_radius=22&height=44&width=375&locale=pt_BR&scale=2"
          alt={t.auth.signInWithApple}
          width={375}
          height={44}
          className="h-auto w-full max-w-[375px]"
        />
      </button>
      <p className="text-center text-sm text-ink-2">ou entre com e-mail</p>
      <form onSubmit={submit} className="space-y-4">
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
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {unconfirmed && !resent && (
          <Button type="button" variant="plain" className="px-0" onClick={resend}>
            {t.auth.resend}
          </Button>
        )}
        {resent && <Notice tone="done">{t.auth.resent}</Notice>}
        <Button type="submit" className="w-full" disabled={busy || !isConfigured}>
          {t.auth.signIn}
        </Button>
        <p className="text-center text-sm">
          <Link href="/recuperar-senha" className="text-accent hover:underline">
            {t.auth.forgot}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
