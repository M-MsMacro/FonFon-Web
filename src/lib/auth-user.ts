import type { User } from "@supabase/supabase-js";
import { t } from "./strings";

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

export function profileSeed(user: User): { name: string; email: string | null } {
  const meta = user.user_metadata ?? {};
  const email = text(user.email) ?? text(meta.email);
  const name =
    text(meta.display_name) ?? text(meta.full_name) ?? text(meta.name) ?? text(email?.split("@")[0]) ?? t.auth.defaultName;
  return { name, email };
}
