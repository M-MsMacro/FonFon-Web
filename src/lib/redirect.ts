export function safeNext(value: string | null | undefined, fallback = "/pro"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
