# Montra

Website for **Montra**, a personal money tracker. It has a marketing landing page and a web app (sign-in, transactions and analytics). Built with React, TypeScript and Tailwind CSS from Figma Make designs.

## Tech stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Inter font, self-hosted via `@fontsource/inter`
- Oxlint
- Supabase (Google sign-in and the `transactions` table) for the web app
- `motion` (list animations) and `react-icons` (category icons) for the web app

## Getting started

Requires Node.js 20.19+ or 22.12+. The web app also needs a `.env` file (see [Environment variables](#environment-variables)); the landing page works without one.

```bash
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run the linter |
| `npm run typecheck` | Check the TypeScript types |

## Project structure

```
src/
├── assets/
│   └── images/           Logo, 3D phone and app screenshots
├── components/           Landing page pieces
│   ├── layout/           Header, Footer
│   ├── sections/         Hero, StatStrip, HowItWorks, Benefits,
│   │                     Testimonials, Secure, Cta
│   └── ui/               Shared pieces: PhoneMock, FloatCard, Reveal,
│                         StepCard, BenefitCard, MiniDonut, icons, ...
├── constants/
│   └── theme.ts          Colors used across the landing page
├── hooks/
│   └── useHashRoute.ts   Reads the current route from the URL hash
├── lib/
│   └── supabaseClient.ts Supabase client (reads the env variables)
├── pages/
│   └── LandingPage.tsx
├── styles/
│   └── index.css         Tailwind, fonts and global styles
├── web/                  The web app (see below)
├── App.tsx               Picks the landing page or the web app from the route
└── main.tsx
```

The `@` import alias points to `src/` (for example `@/components/layout/Header`).

### Web app (`src/web/`)

The web app is loaded only when someone opens `#/app`, so it does not slow down the landing page. It uses inline styles with CSS variables (the landing page uses Tailwind).

| File or folder | What it contains |
|---|---|
| `WebApp.tsx` | Entry point: session handling, then the login screen or the app |
| `LoginScreen.tsx` | "Continue with Google" and "Continue as Guest" |
| `AppShell.tsx` | Sidebar, tab switching, add / edit / delete, dialogs |
| `tabs/` | `HomeTab`, `AddTab`, `AnalyticsTab`, `SearchTab`, `ProfileTab`, `SettingsTab` |
| `components/` | `MiniCalendar`, `TxRow`, `TxDetailModal`, `EditModal`, `Toast` |
| `hooks.ts` | Date selection and home calendar hooks |
| `icons.tsx` | Inline icons and category icons |
| `types.ts`, `theme.ts`, `categories.ts`, `storage.ts`, `dates.ts`, `helpers.ts`, `styles.ts` | Types, colors, built-in categories, `localStorage`, date helpers, formatting, shared styles |

The `@` import alias points to `src/` (for example `@/components/layout/Header`).

## Routes

The site uses a small hash router (`src/hooks/useHashRoute.ts`).

| URL | Page |
|---|---|
| `#/` (default) | Landing page |
| `#/app` | Web app |

Plain section links such as `#features` are not routes and show the landing page. The **Web Version** buttons on the landing page link to `#/app`.

## Web app

- **Sign in:** *Continue with Google* (through Supabase) or *Continue as Guest*.
- **Signed in:** transactions are read from and written to the Supabase `transactions` table, only for the signed-in user.
- **Guest:** transactions and settings stay in this browser (`localStorage` keys `montra-transactions` and `montra-settings`). Signing out clears the cached transactions of the account that was signed in.
- **Tabs:** Home (monthly summary and calendar), Add, Analytics (week, month and year), Search, Profile and Settings (theme, accent colour, text size).

## Status

The landing page and the web app are in this repository.

Not available yet:

- Filipino language (shown as "Coming soon" in Settings)
- US Dollar and Euro currencies
- Custom categories and subcategories
- A phone-friendly bottom navigation bar (the sidebar is used on every screen size)

## Branching workflow

`master` → `develop` → `release` → `master`

| Branch | Purpose |
|---|---|
| `master` | Stable, production-ready code |
| `develop` | Main development branch where changes are integrated |
| `release` | Testing, final adjustments and release preparation |

Never commit directly to `master`.

## Commit messages

Format: `type: description`

Examples: `feat: add pricing section`, `fix: resolve layout issues`, `style: adjust spacing`, `chore: update dependencies`, `docs: update README`, `refactor: simplify components`.

## Environment variables

The web app reads two variables. Copy `.env.example` to `.env` and fill in your own values. Never commit a real `.env` file.

```powershell
Copy-Item .env.example .env
```

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Project URL from Supabase, for example `https://abcdefghijklmnop.supabase.co` (Project Settings → Data API) |
| `VITE_SUPABASE_ANON_KEY` | Your **publishable** key, which starts with `sb_publishable_` (Project Settings → API Keys) |

Rules for the values: no quotes, no trailing `/` on the URL. Restart `npm run dev` after changing `.env`.

> **Never put a secret key here.** Anything starting with `VITE_` is copied into the public JavaScript. Use only the publishable (or legacy anon) key. Never use the `sb_secret_…` or `service_role` key. Your data is protected by Row Level Security in the database, not by hiding this key.

## Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com) and copy the Project URL and publishable key into `.env`.
2. **Create the table.** Run this in the Supabase SQL editor:

   ```sql
   create table public.transactions (
     id              uuid primary key default gen_random_uuid(),
     user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
     amount          numeric(14,2) not null check (amount > 0),
     type            text not null check (type in ('expense', 'income')),
     parent_category text not null,
     sub_category    text not null,
     notes           text check (char_length(notes) <= 150),
     image_urls      text[],
     latitude        double precision,
     longitude       double precision,
     created_at      timestamptz not null default now(),
     is_edited       boolean not null default false,
     last_edited_at  timestamptz,
     original_amount numeric(14,2),
     original_notes  text
   );

   create index transactions_user_created_idx
     on public.transactions (user_id, created_at desc);

   alter table public.transactions enable row level security;

   create policy "Users manage their own transactions"
     on public.transactions
     for all
     to authenticated
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);

   grant select, insert, update, delete on public.transactions to authenticated;
   ```

   The web app writes `id`, `user_id`, `amount`, `type`, `parent_category`, `sub_category`, `notes`, `created_at`, `is_edited`, `last_edited_at`, `original_amount` and `original_notes`. The photo and location columns are optional and are not used by the web app.
3. **Check Row Level Security.** These two queries should show `true` and one policy that uses `auth.uid() = user_id`:

   ```sql
   select relrowsecurity from pg_class where relname = 'transactions';
   select policyname, cmd, qual, with_check from pg_policies where tablename = 'transactions';
   ```
4. **Turn on Google sign-in** under Authentication → Providers → Google. You need a Client ID and Client Secret from a Google Cloud OAuth client of type *Web application*. Add this Authorized redirect URI to that client: `https://<your-project>.supabase.co/auth/v1/callback`.
5. **Allow the redirect URLs** under Authentication → URL Configuration → Redirect URLs. Add:
   - `http://localhost:5173/**`
   - `http://localhost:5173/#/app`
   - your deployed site URL, once you have one

   The Site URL is not used by the web app. Leave it unchanged if another app depends on it.

The Supabase client uses the PKCE flow (`src/lib/supabaseClient.ts`). The sign-in code comes back in the URL query (`?code=…`), so it does not clash with the `#/app` hash router.