import Image from "next/image";
import Link from "next/link";
import { AppStoreButton } from "@/components/AppStoreButton";
import { t } from "@/lib/strings";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-16 md:flex-row md:items-center">
      <div className="flex-1 space-y-6">
        <p className="flex items-center gap-2 font-brand text-2xl">
          <Image src="/fonfon-mascot.png" alt="" width={40} height={40} className="size-10 object-contain" priority />
          {t.brand.name}
        </p>
        <h1 className="font-brand text-4xl leading-tight md:text-5xl">{t.brandPage.headline}</h1>
        <p className="max-w-xl text-lg text-ink-2">{t.brandPage.body}</p>
        <div className="flex flex-wrap items-center gap-3">
          <AppStoreButton />
          <Link
            href="/entrar"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-card-border bg-card px-6 text-base font-medium hover:bg-sunken"
          >
            {t.brandPage.forTherapists}
          </Link>
        </div>
      </div>
      <Image
        src="/fonfon-mascot.png"
        alt=""
        width={320}
        height={320}
        className="mx-auto w-56 md:w-80"
        priority
      />
    </main>
  );
}
