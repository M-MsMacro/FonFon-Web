import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CheckIcon } from "./icons";

export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export type Tone = "neutral" | "accent" | "done" | "pending" | "alert";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-2 border-card-border",
  accent: "bg-accent-soft text-accent-deep border-accent-mid",
  done: "bg-done-soft text-done border-done-border",
  pending: "bg-pending-soft text-pending border-pending-border",
  alert: "bg-alert-soft text-alert border-alert-border",
};

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-medium border border-card-border bg-card p-4", className)}>{children}</div>
  );
}

export function GroupedCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "divide-y divide-separator overflow-hidden rounded-medium border border-card-border bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  as: Heading = "h2",
}: {
  title: string;
  action?: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-2 flex min-h-8 items-center justify-between gap-3 px-1">
      <Heading className="text-xs font-semibold uppercase tracking-wider text-ink-2">{title}</Heading>
      {action}
    </div>
  );
}

export function StatusChip({
  text,
  tone = "accent",
  check = false,
  uppercase = false,
}: {
  text: string;
  tone?: Tone;
  check?: boolean;
  uppercase?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        uppercase && "uppercase tracking-wide",
        toneClasses[tone],
      )}
    >
      {check && <CheckIcon className="size-3" />}
      {text}
    </span>
  );
}

export function StatTile({
  value,
  unit,
  caption,
  tone = "neutral",
}: {
  value: number;
  unit?: string;
  caption: string;
  tone?: "neutral" | "alert";
}) {
  return (
    <div className="flex-1 rounded-medium border border-card-border bg-card px-3 py-3">
      <p className={cx("text-2xl font-semibold", tone === "alert" && value > 0 ? "text-alert" : "text-ink")}>
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-ink-2">{unit}</span>}
      </p>
      <p className="text-xs text-ink-2">{caption}</p>
    </div>
  );
}

export function EmptyState({ icon, message }: { icon?: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-sm text-ink-2">
      {icon}
      <p className="max-w-sm">{message}</p>
    </div>
  );
}

export function Notice({
  tone = "alert",
  children,
  action,
}: {
  tone?: Tone;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === "alert" ? "alert" : "status"}
      className={cx(
        "flex items-center justify-between gap-3 rounded-small border px-3 py-2 text-sm",
        toneClasses[tone],
      )}
    >
      <span>{children}</span>
      {action}
    </div>
  );
}

const variants = {
  primary: "bg-accent text-on-accent hover:brightness-110",
  secondary: "border border-card-border bg-card text-ink hover:bg-sunken",
  destructive: "border border-alert-border bg-alert-soft text-alert hover:brightness-95",
  plain: "text-accent hover:underline",
} as const;

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-base font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    />
  );
}

export function TextField({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink">{label}</span>
      <input
        {...props}
        className="min-h-11 w-full rounded-small border border-card-border bg-card px-3 text-base text-ink placeholder:text-ink-3"
      />
      {hint && <span className="mt-1 block text-xs text-ink-2">{hint}</span>}
    </label>
  );
}

export function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-deep"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </span>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="px-4 py-8 text-center text-sm text-ink-2">
      {label}
    </p>
  );
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
