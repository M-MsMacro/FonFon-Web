"use client";

import { t } from "@/lib/strings";

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;

export function CopyAndOpenButton({ code }: { code: string }) {
  if (!APP_STORE_URL) {
    return (
      <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-card-border bg-sunken px-6 text-base font-medium text-ink-2">
        {t.brandPage.comingSoon}
      </span>
    );
  }

  async function copyThenOpen() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
    window.location.href = APP_STORE_URL!;
  }

  return (
    <button
      type="button"
      onClick={copyThenOpen}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-base font-medium text-on-accent hover:brightness-110"
    >
      {t.brandPage.appStore}
    </button>
  );
}
