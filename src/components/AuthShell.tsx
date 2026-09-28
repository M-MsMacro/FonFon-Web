import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { t } from "@/lib/strings";

export function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2">
          <Image src="/fonfon-mascot.png" alt="" width={40} height={40} className="size-10 object-contain" priority />
          <span className="font-brand text-2xl text-ink">
            {t.brand.name} <span className="text-accent">{t.brand.tier}</span>
          </span>
        </Link>

        <div className="space-y-5 rounded-medium border border-card-border bg-card p-6">
          <h1 className="font-brand text-2xl text-ink">{title}</h1>
          {children}
        </div>

        {footer && <div className="space-y-2 text-center text-sm text-ink-2">{footer}</div>}
      </div>
    </main>
  );
}
