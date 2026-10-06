import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const guestOnly = ["/entrar", "/criar-conta"];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await client.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  if (!signedIn && pathname.startsWith("/fono")) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/entrar";
    redirect.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(redirect);
  }

  if (signedIn && guestOnly.includes(pathname)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/fono";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return response;
}
