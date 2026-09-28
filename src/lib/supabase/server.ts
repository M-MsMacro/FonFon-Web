import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("supabase_not_configured");
  const store = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value, options }) => store.set(name, value, options));
      },
    },
  });
}
