# Montra

Marketing landing page for **Montra**, a personal money tracker. Built with React, TypeScript and Tailwind CSS from a Figma Make design.

## Tech stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Inter font, self-hosted via `@fontsource/inter`
- Oxlint

## Getting started

Requires Node.js 20.19+ or 22.12+.

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
│   └── images/       Logo, 3D phone and app screenshots
├── components/
│   ├── layout/       Header, Footer
│   ├── sections/     Hero, StatStrip, HowItWorks, Benefits,
│   │                 Testimonials, Secure, Cta
│   └── ui/           Shared pieces: PhoneMock, FloatCard, Reveal,
│                     StepCard, BenefitCard, MiniDonut, icons, ...
├── constants/
│   └── theme.ts      Colors used across the page
├── pages/
│   └── LandingPage.tsx
├── styles/
│   └── index.css     Tailwind, fonts and global styles
├── App.tsx
└── main.tsx
```

The `@` import alias points to `src/` (for example `@/components/layout/Header`).

## Status

This repository contains the landing page only. The web app (sign-in and transaction tracking) is planned as a separate phase.

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

Copy `.env.example` to `.env` when the web app is added. Never commit a real `.env` file.
