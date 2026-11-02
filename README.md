# Motra

Marketing landing page for **Motra**, a personal money tracker. Converted from a Figma export into a React application.

## Tech stack

- React 19 (JSX)
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

## Project structure

```
src/
├── assets/
│   ├── images/       Logo and app screenshots
│   └── icons/        SVG icons
├── components/
│   ├── layout/       Header, Footer
│   ├── sections/     Hero, StatStrip, HowItWorks, Benefits,
│   │                 Testimonials, Secure, Cta
│   └── ui/           BenefitCard, IconTile, ReviewCard, StarRating, StepCard
├── constants/
│   └── content.js    Page text: nav links, stats, reviews, footer links
├── pages/
│   └── LandingPage.jsx
├── styles/
│   └── index.css     Tailwind and font setup
├── App.jsx
└── main.jsx
```

The `@` import alias points to `src/` (for example `@/components/layout/Header`).

## Design notes

The layout comes straight from the Figma export: a fixed 1337px-wide desktop design using Tailwind arbitrary values. It is not responsive yet.

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