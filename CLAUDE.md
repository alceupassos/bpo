# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`bpo-angra` — an MVP SaaS for **BPO financeiro** (financial back-office) for Brazilian *Simples Nacional* small companies. Two audiences: the internal BPO operator and the end client who watches their own finances. Product spec (in Portuguese) lives in `BPO.md`; navigation/continuity plan in `next.md`. The product is deliberately **not an ERP** — keep features lean and operational.

The UI is a dark, rounded "shell" app: vertical icon rail + horizontal pill nav + KPI cards + ApexCharts. The Dashboard (`/`) is the design-system parent; every other module reuses the same cards/tables/charts and only swaps data, labels, and context.

## Monorepo layout

pnpm workspace (`pnpm-workspace.yaml`) with two packages:

- **Root (`.`)** — the Next.js 15 / React 19 frontend (App Router). Code lives in `app/`, `components/`, `lib/`. Package name `bpo-angra`.
- **`apps/api`** — the NestJS 10 backend, package `@angra/api`. Runs on Express, global prefix `/api`, bound to `127.0.0.1`.

The root `tsconfig.json` **excludes `apps/api`** — the API has its own `apps/api/tsconfig.json`. Don't expect root `tsc` to typecheck the backend.

## Commands

All run from the repo root unless noted. Uses **pnpm** (Windows + PowerShell 5.1 environment — no `&&`/`||` chaining in that shell).

| Task | Command |
| --- | --- |
| Frontend dev (default) | `pnpm dev` (next dev) |
| Frontend dev (fixed host/port) | `pnpm dev:web` → `127.0.0.1:3001` |
| Backend dev (watch) | `pnpm dev:api` → NestJS on `127.0.0.1:3002` (`PORT` env overrides) |
| Frontend build | `pnpm build` |
| Backend build | `pnpm build:api` (tsc → `apps/api/dist`) |
| Frontend typecheck | `pnpm typecheck` (`tsc --noEmit`) |
| Backend typecheck | `pnpm typecheck:api` |
| Lint (frontend) | `pnpm lint` (eslint-config-next) |

There is **no test runner configured** in either package — don't invent `pnpm test`.

The running preview (see `next.md` / the `preview-*.out.log` files) uses ports **4501** (web) and **4502** (`/api`), driven by `PORT`/host overrides rather than the default dev scripts. Note the port mismatch: docs reference 4501/4502, the `dev:*` scripts use 3001/3002. Confirm which is live before assuming.

## Architecture — the big picture

### Frontend is currently static, not API-backed

This is the most important thing to understand before editing. **The frontend does not call the backend yet.** Every screen renders from hardcoded fixtures in `lib/data.ts` (KPIs, nav items, table rows, per-route `pageSummaries`). Wiring the UI to the API endpoints is explicitly the *next* cycle in `next.md` (planned `lib/api.ts`, `lib/formatters.ts`, loading/empty/error states, seed fallback). If asked to "connect data," that work has not started.

### Backend returns in-memory mock data, no database

Despite `BPO.md` and `.env.example` specifying PostgreSQL + JWT + Hugging Face OCR, the NestJS services currently return **hardcoded objects** (e.g. `dashboard.service.ts` returns literal numbers). There is **no Prisma/TypeORM, no DB connection, no auth guard, no migrations, no seeds** in the code yet — only `@nestjs/config` reading `.env`. Treat the entity/endpoint lists in `BPO.md` as the target spec, not the current state.

### Module structure (backend)

`apps/api/src/main.ts` bootstraps with a global `ValidationPipe` (`whitelist`, `transform`) and CORS on. `app.module.ts` imports one module per domain: `auth`, `companies`, `users`, `documents`, `financial-entries`, `banking`, `approvals`, `dashboard`, `audit`. Each follows the standard NestJS `*.module.ts` / `*.controller.ts` / `*.service.ts` triad. DTOs are defined inline in controllers using `class-validator` decorators (see `financial-entries.controller.ts`). Config loads `.env` then `apps/api/.env`.

### Frontend rendering pattern

- `app/layout.tsx` is minimal (html/body + `globals.css`). Each route is a thin `page.tsx` that composes `PageShell` + a screen/overview component fed from `lib/data.ts`.
- `components/page-shell.tsx` is the dark rounded shell (sidebar + main, the signature `rounded-[46px] bg-black` container). Most module pages use `components/module-overview.tsx`, a reusable metrics + table + chart layout — this is the "same components, different data" design-system contract from `BPO.md`. The Dashboard uses its own richer `dashboard-screen.tsx`.
- Charts go through `components/apex-chart.tsx`, a `"use client"` wrapper that dynamically imports `react-apexcharts` with `ssr: false` and merges per-chart options over shared dark `baseOptions`. Always use this wrapper rather than importing ApexCharts directly (SSR will break otherwise).
- Icons are referenced by **string name** in data (`lib/types.ts` `NavItem.icon`) and mapped to lucide-react components in `components/icon-resolver.tsx`. Add new icons there.

### Styling / design tokens

Tailwind (`tailwind.config.ts`) maps semantic color names (`bg`, `surface`, `navy`, `accent`, `danger`, `text-soft`, …) to **CSS variables** defined in `app/globals.css`. Use the semantic Tailwind classes, not raw hex, so the dark theme stays consistent. The institutional palette and dark-adaptation rules are documented in `BPO.md` ("Direcao visual obrigatoria").

### Routes (must all resolve — no 404s, per `next.md`)

`/`, `/contas-a-pagar`, `/contas-a-receber`, `/conciliacao`, `/ocr-documentos`, `/relatorios`, `/painel-cliente`, `/configuracoes`. The nav/sidebar/quick-actions all point at these real routes; keep that invariant when adding links.

## Conventions

- TypeScript `strict` everywhere; path alias `@/*` → repo root (frontend only).
- Frontend is App-Router server components by default; add `"use client"` only for interactive/chart/motion components (ApexChart, framer-motion pieces).
- UI copy, labels, and product docs are in **Portuguese** (often without accents). Match the surrounding language.
- Framer Motion is for subtle entrance/hover/drawer motion only — keep it restrained (`BPO.md` "Movimento").
- Secrets stay in `.env` / `.env.local` (never hardcoded). If Hugging Face OCR isn't configured, the document flow must degrade to manual review, never block.

## Git access may be blocked by "dubious ownership"

This *is* a git repo. Under some sessions git commands fail with `detected dubious ownership` when `.git`'s Windows owner differs from the user running the session (the harness then reports this as "not a git repository"). If — and only if — git refuses for that reason, run:

```
git config --global --add safe.directory "C:/Users/Alceu Passos/angra/bpo.angra"
```

If `git status`/`rev-parse`/etc. already work, no action is needed.
