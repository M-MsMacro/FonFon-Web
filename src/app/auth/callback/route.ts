import { NextResponse } from "next/server";
import { safeNext } from "@/lib/redirect";
import { serverClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const client = await serverClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}
