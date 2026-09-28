import type { Metadata } from "next";
import Image from "next/image";
import { AppStoreButton } from "@/components/AppStoreButton";
import { t } from "@/lib/strings";

export const metadata: Metadata = {
  title: t.brandPage.linkTitle,
  robots: { index: false, follow: false },
};

const CODE_FORMAT = /^[A-Z0-9]{2}-[A-Z0-9]{4}$/;

export default async function LinkPage({ params }: PageProps<"/v/[codigo]">) {
  const { codigo } = await params;
  const code = decodeURIComponent(codigo).trim().toUpperCase();
  const isValid = CODE_FORMAT.test(code);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-6 py-12">
      <Image src="/fonfon-mascot.png" alt="" width={160} height={160} className="mx-auto w-32" priority />
      <h1 className="text-center font-brand text-3xl">{t.brandPage.linkTitle}</h1>

      {isValid ? (
        <>
          <div className="rounded-medium border border-card-border bg-card p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-2">{t.brandPage.linkCode}</p>
            <p className="select-all font-brand text-4xl tracking-[0.25em]">{code}</p>
          </div>
          <div>
            <p className="mb-2 text-ink-2">{t.brandPage.linkIntro}</p>
            <ol className="list-decimal space-y-1 pl-5">
              {t.brandPage.linkSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <p className="text-center text-ink-2">{t.brandPage.linkInvalid}</p>
      )}

      <div className="flex justify-center">
        <AppStoreButton />
      </div>
    </main>
  );
}
