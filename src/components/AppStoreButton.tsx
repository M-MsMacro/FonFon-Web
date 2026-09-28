import { t } from "@/lib/strings";

const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL;

export function AppStoreButton() {
  return APP_STORE_URL ? (
    <a
      href={APP_STORE_URL}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-base font-medium text-on-accent hover:brightness-110"
    >
      {t.brandPage.appStore}
    </a>
  ) : (
    <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-card-border bg-sunken px-6 text-base font-medium text-ink-2">
      {t.brandPage.comingSoon}
    </span>
  );
}
