"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { t } from "@/lib/strings";
import { XIcon } from "./icons";

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={title}
      className="m-auto w-[min(92vw,42rem)] rounded-medium border border-card-border bg-page p-0 text-ink backdrop:bg-black/60"
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-separator px-4 py-3">
            <h2 className="font-brand text-xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="inline-flex size-11 items-center justify-center rounded-full hover:bg-sunken"
            >
              <XIcon className="size-5" />
            </button>
          </header>
          <div className="overflow-y-auto px-4 py-4">{children}</div>
          {footer && <footer className="border-t border-separator px-4 py-3">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
