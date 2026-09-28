@AGENTS.md

# Code style

- No comments in code unless explicitly asked. Write self-explanatory code instead.
- All UI text lives in `src/lib/strings.ts` (pt-BR). No string literals in components.
- All colors, radii and spacing come from the tokens in `src/app/globals.css` (copied from `Macro/Packages/FonFonDesignSystem` and `AppFono/.../ProColors.xcassets`). No raw hex values or arbitrary spacing in components.

# What this is

FonFon Pro Web: the speech therapist app (iOS `Macro/AppFono/FonFon-Fono`) as a Next.js site, plus the public pages behind the QR code that links a child to a therapist. Spec: `../Macro/Specs/fono-web-nextjs.md` (source of truth for behavior).

- `/` landing, `/v/[codigo]` QR destination, `/.well-known/apple-app-site-association` Universal Link file.
- `/entrar`, `/criar-conta`, `/recuperar-senha`, `/redefinir-senha`, `/auth/callback`: e-mail and password accounts (Supabase Auth).
- `/pro/**`: the therapist area. Client components, data through SWR hooks in `src/lib/hooks.ts`.

# Backend

There is no server of our own. The browser talks straight to Supabase (same project as the iOS apps) with the public anon key; access control is RLS plus the SQL functions in `../Macro/supabase/migrations/`. `src/lib/api.ts` mirrors `Macro/Packages/FonFonSupabase/.../SupabaseFonFonAPI.swift`; when a function changes there, change it here.

- Never use or commit the `service_role` key. Env vars live in `.env.local` (gitignored); copy `.env.example`.
- The web app is online-only. No cache of patient data in the browser, no offline queue.
- Data rules (week starts Monday, 25 min daily target, age, day grouping) mirror `PracticeCalendar.swift`; keep them in `src/lib/calendar.ts` and covered by `npm test`.

# Commands

- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`.
- After adding or renaming routes run `npx next typegen` so `LayoutProps`/`PageProps` know them.

# Skills for this project

- `vercel-react-best-practices` for any React/Next.js code (waterfalls, bundle size, re-renders).
- `feature-spec` before any non-trivial change; specs go in `../Macro/Specs/`.
- `mobile-code-review` before merging UI changes (hardcoded strings, layout on small screens, state that must survive navigation).
- `platform-parity` only for iOS ↔ web screen differences: fix the root cause once, not per screen.
