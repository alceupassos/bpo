# promptbak.md — Prompt de handoff (continuar o bpo-angra com outro modelo)

> Cole este arquivo inteiro como contexto inicial para outro modelo/sessão caso os créditos
> acabem. Ele resume tudo: produto, stack, estado atual, decisões e o que falta. Acompanhe o
> progresso real em `plano.md` (checklist vivo) e o spec em `BPO.md`.

---

## Seu papel

Você é um engenheiro full-stack continuando o desenvolvimento do **bpo-angra**, um SaaS de
**BPO financeiro para empresas do Simples Nacional** (Brasil). Trabalhe em PT-BR no produto.
Ambiente: Windows + PowerShell 5.1/7, pnpm. O app já está em produção em **https://bpo.angra.io**.

## STATUS (entregue nesta rodada — 2026-06-16)

✅ **Tudo abaixo já está implementado e no ar em https://bpo.angra.io.** Use isto como verdade; o
restante deste arquivo é contexto/decisões. Acompanhe `plano.md` para o detalhe item a item.

- Design **Monetra claro** aplicado em todo o app (globals.css/tailwind/components).
- Backend migrado para **PostgreSQL + Prisma** (schema com 11 entidades + Product, FiscalNote,
  NoteItem, CashSession, CashEntry, ChatThread, ChatMessage). Migration `init` aplicada; seed rodado.
- **IA de visão** (`ai/ai-vision.service.ts`) lendo NF via OpenAI/Gemini (chaves no `.env` raiz da
  VPS), com fallback manual obrigatório.
- Módulos novos no ar: **products, cash (caixa), fiscal-notes (leitor NF), chat (WhatsApp)**.
- Telas novas no ar: **/produtos, /caixa, /notas, /whatsapp** + as 8 antigas, todas 200.
- **VPS Postgres:** DB `angra_bpo`, role `bpo` (senha em `apps/api/.env` da VPS, var DATABASE_URL).
  `apps/api/.env` na VPS tem PORT=5002, DATABASE_URL, JWT_SECRET; as chaves de IA vêm do `.env` raiz.
- Dev local: Postgres em Docker container `bpo-pg` (postgres:16, porta 5432, db angra_bpo,
  user/senha postgres/postgres). `apps/api/.env` local aponta para ele.
- Pendência menor: validar a IA de visão com foto real de cupom (chaves já configuradas em prod).

## Produto (resumo)

BPO financeiro leve e operacional (NÃO é ERP): contas a pagar/receber, conciliação, OCR de
documentos, relatórios, painel do cliente. Dois públicos: operador interno do BPO e cliente
final. Spec completo em `BPO.md`. Continuidade em `next.md`.

## Stack e layout do repo (monorepo pnpm)

- **Frontend** (raiz): Next.js 15 / React 19 (App Router), Tailwind, ApexCharts (wrapper
  `components/apex-chart.tsx`), Framer Motion. Código em `app/`, `components/`, `lib/`.
- **Backend** `apps/api`: NestJS 10 (Express), prefixo global `/api`, bind 127.0.0.1.
- Comandos: `pnpm dev:web` (3001), `pnpm dev:api` (3002), `pnpm build`, `pnpm build:api`,
  `pnpm typecheck`, `pnpm typecheck:api`. **Sem test runner.**
- **Armadilha pnpm:** a verificação de deps antes de cada script falha (build scripts ignorados
  de sharp/@nestjs/core/unrs-resolver). Contorne chamando binários direto:
  `node_modules/.bin/tsc -p apps/api/tsconfig.json` e `node_modules/.bin/next build`. Idem em prod.

## Estado ATUAL (antes desta rodada de mudanças)

- Login JWT funciona (HS256 via `crypto` nativo, sem libs — `apps/api/src/modules/auth/jwt.util.ts`),
  guard global (`APP_GUARD`) + `@Public()` no login, escopo por empresa (`companyScope`/`@CurrentUser`).
  Usuários demo (senha `angra123`): `operador@angra.local` (OPERADOR_BPO, vê tudo),
  `gestor@praiaazul.com.br` (GESTOR company-1), `financeiro@bompreco.com.br` (FINANCEIRO company-2),
  `admin@angra.local` (ADMIN).
- Backend = **mock in-memory** em `apps/api/src/data/seed.ts` (3 empresas, 60 a pagar, 40 receber,
  30 docs, 20 conciliações, 8 aprovações). 9 módulos: auth, companies, users, documents,
  financial-entries, banking, approvals, dashboard, audit. Upload + OCR com fallback manual.
- Frontend: 8 rotas (/, /contas-a-pagar, /contas-a-receber, /conciliacao, /ocr-documentos,
  /relatorios, /painel-cliente, /configuracoes), consomem a API via `lib/api.ts` (fetch + cookie
  httpOnly `bpo_token` + **fallback para fixtures de `lib/data.ts`** quando a API cai).
  `lib/formatters.ts` tem BRL/data/status + adapters entidade→TableRow. `middleware.ts` protege
  rotas (redirect /login via headers de proxy). Tema **dark** (sendo trocado, ver abaixo).

## MUDANÇAS DESTA RODADA (o que você deve entregar)

### Decisões já tomadas pelo usuário (não re-perguntar)
1. **Design = Monetra CLARO** (arquivo de referência `monetra.webp` na raiz). Modo claro, fundo
   cinza-claro, cards brancos arredondados, sombras leves, **acento verde-limão `#9fe870`**, pills
   pretos (`#111316`) para abas ativas/tooltip, rail de ícones à esquerda, nav em pill no topo,
   coluna direita com cartão + ações. **Isto substitui a direção dark do BPO.md.**
2. **Persistência = PostgreSQL via Prisma** (a VPS já tem PG16). Migrar TUDO (finance + novos
   módulos) para o banco, mantendo as assinaturas dos endpoints.
3. **Leitor de Nota Fiscal = IA real (LLM vision)** usando as chaves do `.env` raiz
   (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`/grok, `DEEPSEEK_API_KEY`). Default sugerido:
   OpenAI `gpt-4o-mini` (vision+JSON); senão Gemini `gemini-1.5-flash`. **Fallback manual
   obrigatório**: sem chave / erro / timeout → nota entra em `NEEDS_REVIEW`, nunca trava.
4. **WhatsApp = chat in-app funcional** (mensagens persistidas; anexos viram FiscalNote no leitor).
   Interface `ChatGateway` plugável para um gateway real depois (há um app `whatsgate` na VPS).

### Funcionalidades novas
- **Envio de notas → cadastro de produtos**: upload de NF → IA extrai itens → cadastra `Product`.
- **Lançamento de notas e caixa**: NF vira `FinancialEntry` (a pagar) e/ou `CashEntry`.
- **Caixa (POS)**: abrir/fechar sessão, lançar venda/entrada/saída/sangria/suprimento, saldo.
- **Leitor de NF** de padaria/posto/boleto (IA).
- **WhatsApp** in-app.

### Entidades novas (Prisma, além das 11 do BPO.md)
`Product`, `Supplier`(opcional), `FiscalNote`, `NoteItem`, `CashSession`, `CashEntry`,
`ChatThread`, `ChatMessage`. Enums novos: `CashSessionStatus`, `CashEntryType`, `NoteType`,
`MessageDirection`. Estados de doc/lançamento/conciliação conforme BPO.md.

### Módulos backend novos (`apps/api/src/modules/`)
- `ai` → `ai-vision.service.ts` (adapter LLM vision, JSON estruturado, fallback).
- `fiscal-notes` → upload/IA, GET, review, post (→financeiro/caixa), register-products.
- `products` → CRUD escopado por empresa.
- `cash` → current/open/close/entries/sessions, saldo calculado.
- `chat` → threads/messages/upload (anexo→fiscal-note), interface ChatGateway.

### Telas novas (`app/`, estilo Monetra claro)
`/notas` (upload+IA+revisão+ações), `/produtos` (catálogo), `/caixa` (POS), `/whatsapp` (chat).
Adicionar à nav em `lib/data.ts` + ícones em `components/icon-resolver.tsx`. Todas devem
resolver (sem 404). `lib/api.ts`/`lib/formatters.ts` ganham funções/adapters dos novos endpoints.

## Acesso / Deploy (produção)

- **VPS:** `ssh root@62.171.181.241` (Ubuntu 24.04). A chave ed25519 do usuário já está em
  `authorized_keys` (acesso sem senha). Senha fallback em `.env` raiz (`SSH_PWD`). ATENÇÃO: o
  `.env` lista IP `.24` (errado); o correto é `.241`.
- **Código em produção:** `/var/www/bpo.angra.io` (NÃO é git — atualizar via `scp` de tarball do
  source e extrair por cima, preservando `.env`/`.env.local`/`node_modules`).
- **PM2:** `bpo-web` (`next start -H 127.0.0.1 -p 5001`) e `bpo-api` (`apps/api/dist/main.js`,
  `PORT=5002`, cwd=raiz). `ecosystem.config.js` (portas 5001/5002). `pm2 restart bpo-api bpo-web`.
- **nginx:** vhost `bpo.angra.io` → `/`→5001, `/api/`→5002, 443 com Let's Encrypt (certbot),
  Cloudflare em modo **Full** (proxy laranja). HTTPS público OK.
- **Postgres:** PG16 já instalado na VPS. Criar database+usuário do bpo e pôr `DATABASE_URL` em
  `apps/api/.env`. Copiar também as chaves de IA do `.env` raiz para `apps/api/.env`.
- **Build em prod:** `node_modules/.bin/next build` (com `NEXT_PUBLIC_API_URL=http://127.0.0.1:5002/api`)
  e `node_modules/.bin/tsc -p apps/api/tsconfig.json` (apagar `apps/api/dist` antes). Depois
  `prisma migrate deploy` + `prisma db seed` + `pm2 restart`.

## Convenções
- TypeScript strict. Path alias `@/*` (frontend). Copy em PT-BR (muitas vezes sem acento).
- Server components fazem o fetch (token via cookie httpOnly); client components só renderizam.
- Segredos só em `.env`/`apps/api/.env` (gitignored). OCR/IA: se não configurado, fallback manual.
- Charts sempre via `components/apex-chart.tsx` (SSR off).

## Como continuar
1. Leia `plano.md` (estado real, com checkboxes) e retome o primeiro item não concluído.
2. Mantenha `plano.md` atualizado a cada item entregue.
3. Verifique localmente (`prisma generate`, typecheck, `next build`) e valide na VPS via SSH.
4. Critérios de aceite: todas as rotas 200 sem 404; visual Monetra claro coerente; leitor de NF
   funciona com fallback; caixa persiste após restart; escopo do cliente preservado; HTTPS OK.
