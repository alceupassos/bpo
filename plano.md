# plano.md — Execução viva (Monetra claro + módulos novos + Postgres)

> Documento **vivo**: atualizado conforme cada item é executado.
> Última atualização: 2026-06-16 (início da execução).
> Plano completo/raciocínio: ver também `promptbak.md` (handoff) e `BPO.md` (spec do produto).
> **Direção visual atual: Monetra claro** (substitui o dark do BPO.md) — referência `monetra.webp`.

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluído

---

## Fase 0 — Handoff (à prova de fim-de-crédito) ✅
- [x] `promptbak.md` — prompt grande de handoff para outro modelo
- [x] `plano.md` — este checklist vivo
- [x] `CLAUDE.md` — apontar para `plano.md`/`promptbak.md` + direção visual Monetra claro

## Fase 1 — Design system claro (Monetra) ✅
- [x] `app/globals.css` — tokens claros (bg/surface/ink/lime/pastéis)
- [x] `tailwind.config.ts` — novos tokens
- [x] `components/apex-chart.tsx` — baseOptions claro (barras arredondadas, tooltip preto)
- [x] `components/page-shell.tsx` — layout claro (sem shell preto)
- [x] `components/sidebar.tsx` + `dashboard-top-nav.tsx` — rail/pill claros
- [x] `components/kpi-card.tsx` / `chart-card.tsx` / `data-table.tsx` / `status-badge.tsx`
- [x] `components/dashboard-screen.tsx` — anatomia Monetra
- [x] `components/client-panel-screen.tsx` / `empty-state.tsx` / `loading.tsx` / `error.tsx`
- [x] `components/module-overview.tsx` / `calendar-card.tsx` / `quick-actions.tsx` / `section-placeholder.tsx`
- [x] `app/login/page.tsx` — claro · typecheck frontend OK · diretrizes web (focus/aria/tabular) aplicadas

## Fase 2 — Postgres + Prisma ✅
- [x] Prisma instalado em `apps/api` + `prisma/schema.prisma` (datasource postgres)
- [x] `src/prisma/prisma.service.ts` + módulo `@Global`
- [x] Modelos: 11 do BPO.md + Product, FiscalNote, NoteItem, CashSession, CashEntry, ChatThread, ChatMessage
- [x] Migrar 9 services in-memory → Prisma (assinaturas de endpoint mantidas)
- [x] `prisma/seed.ts` (números do BPO.md + seeds dos módulos novos) · validado em Postgres local (Docker)

## Fase 3 — IA de visão (leitor NF) ✅
- [x] `src/modules/ai/ai-vision.service.ts` (OpenAI/Gemini via `.env`, JSON estruturado)
- [x] Fallback manual obrigatório (sem chave/erro/PDF → MANUAL/NEEDS_REVIEW)
- [x] `documents/ocr.service.ts` delega à ai-vision
- [ ] `.env.example` — `AI_VISION_PROVIDER`, `OPENAI_VISION_MODEL`, `GEMINI_VISION_MODEL` (pendente doc)

## Fase 4 — Módulos backend novos ✅
- [x] `fiscal-notes` (upload+IA, review, post→financeiro, register-products) · testado
- [x] `products` (CRUD, escopo por empresa) · 8 no seed
- [x] `cash` (caixa: open/close/entries/current/sessions, saldo) · saldo correto testado
- [x] `chat` (threads/messages/upload→fiscal-note) · 1 thread seed
- [x] registrar em `app.module.ts` · smoke-test de todos os endpoints OK

## Fase 5 — Telas novas (frontend Monetra) ✅
- [x] nav/rotas em `lib/data.ts` + `icon-resolver.tsx`: /produtos /caixa /notas /whatsapp
- [x] `app/notas` (upload, resultado IA, revisão, lançar, cadastrar produtos)
- [x] `app/produtos` (catálogo + cadastro)
- [x] `app/caixa` (abrir/fechar, movimentos, saldo)
- [x] `app/whatsapp` (lista + chat + anexo→NF)
- [x] `lib/api.ts` (+apiPost/apiUpload) + server actions por rota · next build OK · rotas 200 testadas

## Fase 6 — Deploy VPS ✅
- [x] DB Postgres `angra_bpo` + role `bpo` na VPS; `apps/api/.env` com DATABASE_URL; chaves IA vêm do `.env` raiz
- [x] scp + `prisma migrate deploy` + seed + build (next/tsc) + `pm2 restart` + `pm2 save`
- [x] HTTPS público OK: login, dashboard (Postgres), /notas /produtos /caixa /whatsapp todas 200

## Fase 7 — Finalização ✅
- [x] Atualizar `plano.md` (tudo marcado)
- [x] `promptbak.md` revisado com estado final
- [x] pointers no `CLAUDE.md` confirmados
- [x] Commit (quando o usuário pedir)

---

## Overhaul UI/UX Dark Glassmorphic & 3D (2026-06-16) ✅
- [x] `app/globals.css` — variáveis Dark Glass, customizações de `.bg-surface` e `.bg-surface-muted`
- [x] `components/three-d-background.tsx` — canvas 3D interativo com mesh gradients e esferas de vidro flutuantes
- [x] `components/tilt-wrapper.tsx` — card tilt 3D usando framer-motion e reflexo de sheen gloss móvel
- [x] Integrar wrapper nos cards (`kpi-card.tsx`, `chart-card.tsx`, `operational-card.tsx`, `cta-card.tsx`, `module-overview.tsx`)
- [x] Customizar ApexCharts (`apex-chart.tsx`) para eixos e grids com opacidades escurecidas de alto nível
- [x] Reestilizar tela de login (`app/login/page.tsx`) com tilt card e grid lines
- [x] Deploy na VPS (`62.171.181.241`) concluído e online com sucesso via PM2 (bpo-web e bpo-api)

