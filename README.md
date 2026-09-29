# FonFon Web

Speech therapist area of FonFon in Next.js, plus the public pages for the linking QR code. Behavior is defined in `../Macro/Specs/fono-web-nextjs.md`.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (the same publishable key the iOS apps use, in `Macro/Config/Supabase.xcconfig`). Never use the `service_role` key here.

## Supabase settings this site needs

In the Supabase dashboard (Authentication):

- Providers → Email enabled, "Confirm email" on.
- Providers → Apple enabled. In Apple Developer, create a Services ID linked to the iOS therapist App ID (`br.academy.marcos.FonFon-Fono`) and a Sign in with Apple key. Register domain `vwyaxmhmumwdgyllxjut.supabase.co` and return URL `https://vwyaxmhmumwdgyllxjut.supabase.co/auth/v1/callback` on that Services ID. In Supabase Apple Client IDs, put the Services ID **first** and keep the iOS App ID in the list so native and web sign-in use the same Supabase account. Add the generated client secret to the provider settings.
- URL Configuration → Site URL `https://fonfonapp.com.br`; Redirect URLs `https://fonfonapp.com.br/auth/callback**` and `http://localhost:3000/auth/callback**` (the callback includes query parameters such as `provider` and `next`).
- SMTP → a custom SMTP sender on `fonfonapp.com.br` (the default sender is rate limited).

## Deploy (Netlify)

Connect the repository, keep the detected Next.js settings (`netlify.toml` pins Node 22) and set the three variables from `.env.example` plus `NEXT_PUBLIC_APP_STORE_URL` when the app is live. Add `fonfonapp.com.br` under Domain management and point the HostGator DNS records to Netlify.

## Universal Links

`/.well-known/apple-app-site-association` already lists `/v/*` for `YXSF57PF32.br.academy.marcos.Macro`. The iOS app still needs the Associated Domains entitlement `applinks:fonfonapp.com.br`.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
