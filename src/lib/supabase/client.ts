import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);

let client: SupabaseClient | undefined;

export function supabase(): SupabaseClient {
  if (!url || !anonKey) throw new Error("supabase_not_configured");
  client ??= createBrowserClient(url, anonKey);
  return client;
}
