# FonFon Pro Web

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
- URL Configuration → Site URL `https://fonfonapp.com.br`; Redirect URLs `https://fonfonapp.com.br/auth/callback` and `http://localhost:3000/auth/callback`.
- SMTP → a custom SMTP sender on `fonfonapp.com.br` (the default sender is rate limited).

## Deploy (Netlify)

Connect the repository, keep the detected Next.js settings (`netlify.toml` pins Node 22) and set the three variables from `.env.example` plus `NEXT_PUBLIC_APP_STORE_URL` when the app is live. Add `fonfonapp.com.br` under Domain management and point the HostGator DNS records to Netlify.

## Universal Links

`/.well-known/apple-app-site-association` already lists `/v/*` for `YXSF57PF32.br.academy.marcos.Macro`. The iOS app still needs the Associated Domains entitlement `applinks:fonfonapp.com.br`.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```
