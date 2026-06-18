# DESCRITIVO TÉCNICO — bpo.angra

> Gerado automaticamente a partir da leitura do código-fonte (2026-06-18).
> Baseado no que existe no repositório; itens marcados com **(a confirmar)** indicam incerteza.

---

## 1. Visão Geral

**BPO Angra** (`bpo-angra`) é um SaaS de BPO financeiro voltado para pequenas empresas brasileiras enquadradas no Simples Nacional. O produto atende dois perfis distintos: o **operador interno do BPO** (que processa documentos, concilia extratos e gera relatórios para múltiplos clientes) e o **cliente final** (que visualiza a saúde financeira da própria empresa em um painel simplificado). O sistema cobre o ciclo completo do back-office financeiro operacional — contas a pagar e a receber, conciliação bancária, OCR de documentos com IA, caixa (PDV), notas fiscais, folha de pagamento, obrigações Simples Nacional e exportação contábil — sem ambição de ser um ERP; o escopo é deliberadamente operacional e enxuto.

O MVP está em produção em **https://bpo.angra.io** (VPS Ubuntu 24.04, PM2 + nginx + PostgreSQL). O frontend é um monolito Next.js 15 / React 19; o backend é uma API NestJS 10 separada, acessível via prefixo `/api`. Os dois processos rodam no mesmo servidor, expostos pelo nginx como um domínio único.

---

## 2. Stack Tecnológica

### Frontend
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, SSR) | 15.x |
| Runtime UI | React | 19.x |
| Linguagem | TypeScript (strict) | 5.7 |
| Estilização | Tailwind CSS (tokens semânticos via CSS vars) | 3.4 |
| Gráficos 1 | ApexCharts (`react-apexcharts`) | 3.53 / 1.4 |
| Gráficos 2 | Recharts | 3.8 |
| Animações | Framer Motion | 11.x |
| Ícones | Lucide React | 0.469 |
| Gerenciador de pacotes | pnpm (workspace) | — |

### Backend
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | NestJS (Express) | 10.x |
| Linguagem | TypeScript (strict) | 5.x |
| ORM | Prisma | 5.22 |
| Banco de dados | PostgreSQL | 14+ (a confirmar versão) |
| Auth | JWT HS256 (crypto nativo Node.js, sem lib externa) | — |
| Upload multipart | `@nestjs/platform-express` | 10.x |
| Configuração | `@nestjs/config` (`.env`) | 3.3 |
| Hot reload dev | `node --watch` + `ts-node` | — |

### IA / Integrações
| Serviço | Uso | Chave |
|---------|-----|-------|
| OpenAI (GPT-4o-mini) | OCR / extração NF por visão | `OPENAI_API_KEY` |
| Google Gemini (1.5-flash) | Fallback OCR se OpenAI indisponível | `GEMINI_API_KEY` |
| Ollama (local) | LLM categorização, copiloto, resumo mensal | `OLLAMA_HOST` |
| xAI / Grok | (a confirmar) Chave presente em `.env` | `XAI_API_KEY` |
| DeepSeek | (a confirmar) Chave presente em `.env` | `DEEPSEEK_API_KEY` |

### Infraestrutura
| Componente | Detalhe |
|-----------|---------|
| Servidor | VPS Ubuntu 24.04 — `62.171.181.241` |
| Processo manager | PM2 (`ecosystem.config.js`) |
| Proxy reverso | nginx (HTTPS, Let's Encrypt) |
| CI/CD | Manual via `scp` + scripts deploy (sem pipeline automatizado) |

---

## 3. Arquitetura

### 3.1 Monorepo pnpm

```
bpo.angra/
├── app/                  # Next.js App Router (frontend)
├── components/           # Componentes React reutilizáveis
├── lib/                  # Tipos, fixtures, camada API, formatadores
├── middleware.ts          # Auth middleware Next.js (JWT cookie)
├── apps/api/             # NestJS backend (@angra/api)
│   ├── src/
│   │   ├── main.ts       # Bootstrap
│   │   ├── modules/      # 22 módulos domínio
│   │   └── prisma/       # PrismaService singleton @Global
│   └── prisma/
│       ├── schema.prisma # 23 modelos
│       ├── seed.ts       # Seed destrutivo (dev)
│       └── seed-simples.ts # Seed aditivo (prod)
├── deploy/               # Scripts auxiliares deploy
├── ecosystem.config.js   # PM2 (bpo-web porta 5001, bpo-api porta 5002)
├── package.json          # Scripts raiz (dev, build, typecheck, lint)
├── pnpm-workspace.yaml   # packages: ['.', 'apps/*']
└── tailwind.config.ts    # Design tokens CSS vars
```

O `tsconfig.json` raiz **exclui `apps/api`**; o backend tem seu próprio tsconfig. Rode `pnpm typecheck` para o frontend e `pnpm typecheck:api` para o backend.

### 3.2 Frontend — Camadas

```
Requisição HTTP
  → middleware.ts          (auth: verifica cookie bpo_token, redireciona /login)
  → app/[rota]/page.tsx   (Server Component: busca dados + renderiza)
      → lib/api.ts         (apiGet/apiPost com cookie JWT → backend)
      → lib/data.ts        (fixtures de fallback se API cair)
      → components/        (Server + Client Components)
          → apex-chart.tsx / recharts-chart.tsx  ("use client", SSR off)
          → tilt-wrapper.tsx  ("use client", Framer Motion)
```

Cada rota é um Server Component fino que:
1. Chama `lib/api.ts` para buscar dados reais (backend)
2. Cai em `lib/data.ts` (fixtures hardcoded) se a API não responder
3. Monta `PageShell` (sidebar + nav) + componente de conteúdo

### 3.3 Backend — Camadas

```
Requisição HTTP → /api/...
  → NestJS (Express)
  → JwtAuthGuard (global, verifica Bearer token)
  → RolesGuard   (global, verifica @Roles decorator)
  → Controller   (rota, DTO validation)
  → Service      (lógica + Prisma queries)
  → PrismaService (singleton @Global → PostgreSQL)
```

Todos os endpoints exceto `POST /auth/login` exigem `Authorization: Bearer <token>`.  
Endpoints com "CompanyScope" filtram dados por `companyId` do token quando o usuário tem role `GESTOR_EMPRESA` ou `FINANCEIRO_EMPRESA`; operadores BPO veem todas as empresas.

### 3.4 Fluxo de Dados Principal

```
Browser
  ↕ HTTPS
nginx (bpo.angra.io)
  ├─ /          → PM2: bpo-web (Next.js :5001)
  └─ /api/      → PM2: bpo-api (NestJS :5002)
                      ↕ Prisma
                  PostgreSQL (local :5432)
```

Em desenvolvimento: `next dev` em `:3001`, NestJS em `:3002`, sem nginx.

### 3.5 Design System

Tokens semânticos definidos em `app/globals.css` e mapeados no Tailwind (`tailwind.config.ts`). As classes Tailwind (ex.: `bg-surface`, `text-soft`, `border-strong`) referenciam CSS vars — nunca usar hex direto.

**Paleta principal:**
- `--bg`: fundo ultra-escuro (dark glassmorphism)
- `--surface`: cards com `backdrop-filter: blur(36px) saturate(220%)`
- `--lime` / `#9fe870`: acento principal (limão)
- `--danger` / `--warning` / `--success`: semáforos de status

**Direção visual:** Monetra dark glassmorphic (`monetra.webp` no repo como referência).

---

## 4. Recursos / Funcionalidades

### 4.1 Autenticação

| Recurso | Arquivo(s) |
|---------|-----------|
| Login com email/senha | `app/login/page.tsx`, `app/login/actions.ts` |
| JWT HS256 (8h TTL, cookie httpOnly `bpo_token`) | `apps/api/src/modules/auth/auth.service.ts`, `jwt.util.ts` |
| Guard global JWT | `apps/api/src/modules/auth/jwt-auth.guard.ts` |
| Roles: ADMIN_PLATAFORMA, OPERADOR_BPO, GESTOR_EMPRESA, FINANCEIRO_EMPRESA | `apps/api/src/modules/auth/roles.guard.ts` |
| Middleware Next.js (redireciona não-autenticados) | `middleware.ts` |
| Logout (limpa cookie) | `app/login/actions.ts` → `logoutAction` |

**Usuários demo (seed):** `operador@angra.local`, `gestor@praiaazul.com.br`, `financeiro@bompreco.com.br`, `admin@angra.local` — senha `angra123`.

### 4.2 Dashboard (Command Center)

| Recurso | Arquivo(s) |
|---------|-----------|
| 8 KPIs (saldo projetado, A pagar, A receber, inadimplência, OCR pendente, conciliação pendente, SLA médio, automação) | `components/dashboard-screen.tsx`, `components/kpi-card.tsx` |
| Gráfico fluxo de caixa (previsto vs realizado, últimos 6 meses) | `components/chart-card.tsx`, `components/recharts-chart.tsx` |
| Carteira ativa (saldo projetado) | `components/dashboard-screen.tsx` |
| Alertas operacionais (inadimplência >90d, DAS a vencer, OCR pendente) | `components/dashboard-screen.tsx` |
| Últimas movimentações (atividade) | `components/contacts-row.tsx` |
| Ações rápidas (8 atalhos) | `components/quick-actions.tsx` |
| KPIs menores (chips) | `components/quick-tiles.tsx` |
| Card calendário operacional | `components/calendar-card.tsx` |
| API: sumário financeiro | `GET /dashboard/summary` → `apps/api/src/modules/dashboard/dashboard.service.ts` |
| API: cashflow 6 meses | `GET /dashboard/cashflow` → `dashboard.service.ts` |
| API: faturamento 12m (teto Simples Nacional R$ 4,8M) | `GET /dashboard/faturamento-12m` → `dashboard.service.ts` |

### 4.3 Contas a Pagar

| Recurso | Arquivo(s) |
|---------|-----------|
| Lista de lançamentos PAYABLE com filtros | `app/contas-a-pagar/page.tsx`, `components/module-overview.tsx` |
| Tabela com status, fornecedor, vencimento, valor | `components/data-table.tsx` |
| Donut de status (A vencer, Vencido, Pago, Parcial, Cancelado) | `components/apex-chart.tsx` |
| Marcar como pago | `POST /financial-entries/:id/mark-paid` |
| API: listar lançamentos | `GET /financial-entries?type=PAYABLE` → `apps/api/src/modules/financial-entries/` |

### 4.4 Contas a Receber

| Recurso | Arquivo(s) |
|---------|-----------|
| Lista de lançamentos RECEIVABLE com aging | `app/contas-a-receber/page.tsx` |
| Previsão de recebimento | `components/module-overview.tsx` |
| Marcar como recebido | `POST /financial-entries/:id/mark-received` |
| Donut aging (0–30, 31–60, 61–90, >90 dias) | `components/apex-chart.tsx` |

### 4.5 Notas Fiscais (OCR + IA)

| Recurso | Arquivo(s) |
|---------|-----------|
| Upload de NF (PDF/imagem) | `app/notas/page.tsx`, `app/notas/actions.ts` → `uploadNote` |
| Extração automática via IA (visão OpenAI/Gemini) | `apps/api/src/modules/ai/ai-vision.service.ts` |
| Revisão manual de campos extraídos | `POST /fiscal-notes/:id/review` |
| Lançamento financeiro (cria FinancialEntry PAYABLE) | `app/notas/actions.ts` → `postNote`; `apps/api/src/modules/fiscal-notes/fiscal-notes.service.ts` |
| Registro automático de produtos (NoteItem → Product) | `POST /fiscal-notes/:id/register-products` |
| Pipeline completo 1 clique (post + register-products) | `app/notas/actions.ts` → `processFullNote`; `POST /fiscal-notes/:id/process-full` |
| Fallback manual obrigatório (sem IA → NEEDS_REVIEW) | `ai-vision.service.ts` (todos os paths de erro → `source: MANUAL`) |
| Direções: RECEBIDA / EMITIDA | `schema.prisma` → `NoteDirection` |

### 4.6 Conciliação Bancária

| Recurso | Arquivo(s) |
|---------|-----------|
| Grade dupla (extrato bancário vs lançamentos) | `app/conciliacao/page.tsx`, `components/module-overview.tsx` |
| Status: IMPORTED, SUGGESTED_MATCH, RECONCILED, DIVERGENT | `schema.prisma` → `ReconciliationStatus` |
| API: transações bancárias | `apps/api/src/modules/banking/` |

### 4.7 OCR de Documentos (Boletos, Recibos, NFs Avulsas)

| Recurso | Arquivo(s) |
|---------|-----------|
| Upload de documentos genéricos | `app/ocr-documentos/page.tsx` |
| Fila de revisão com confiança da IA | `components/module-overview.tsx` |
| Status: UPLOADED, NEEDS_REVIEW, APPROVED, REJECTED | `schema.prisma` → `DocumentStatus` |
| API upload e processamento | `apps/api/src/modules/documents/documents.service.ts`, `ocr.service.ts`, `storage.service.ts` |

### 4.8 Caixa (PDV)

| Recurso | Arquivo(s) |
|---------|-----------|
| Abrir/fechar sessão de caixa | `app/caixa/page.tsx`, `app/caixa/actions.ts` → `openCash`, `closeCash` |
| Lançamentos: SALE, IN, OUT, SANGRIA, SUPRIMENTO | `apps/api/src/modules/cash/cash.service.ts` → `addEntry` |
| Saldo em tempo real (openingAmount + Σ entries) | `GET /cash/current` |
| Leitor de recibo com IA (foto → CashEntry automático) | `POST /cash/receipt/:id` → `cash.service.ts` chama `ai-vision` |
| Métodos de pagamento: DINHEIRO, PIX, CARTAO | `schema.prisma` → `CashEntry.paymentMethod` |
| Histórico de sessões | `GET /cash/sessions` |

### 4.9 Produtos (Catálogo)

| Recurso | Arquivo(s) |
|---------|-----------|
| Listagem e cadastro de produtos | `app/produtos/page.tsx`, `app/produtos/actions.ts` → `createProduct` |
| Campos: nome, código de barras, unidade, preço, categoria, estoque, custo, estoque mínimo | `schema.prisma` → `Product` |
| Auto-cadastro ao processar NF | `fiscal-notes.service.ts` → `registerProducts()` |
| Movimentação de estoque (StockMovement) | `schema.prisma` → `StockMovement`; service (a confirmar implementação completa) |

### 4.10 Clientes e Crediário

| Recurso | Arquivo(s) |
|---------|-----------|
| Cadastro de clientes (CPF, telefone, e-mail, limite de crédito) | `app/clientes/page.tsx`, `app/clientes/actions.ts` → `createCustomer` |
| Identificação biométrica facial (face-api.js) | `schema.prisma` → `Customer.faceDescriptor`; `POST /customers/identify` |
| Identificação WebAuthn (chave de segurança) | `schema.prisma` → `Customer.webauthnCredId` |
| Cobrança por QR code | `app/clientes/actions.ts` → `chargeByQr`; `POST /customers/:id/charge` |
| Saldo crediário e limite | `schema.prisma` → `Customer.creditLimit`, `Customer.balance` |

### 4.11 Fornecedores

| Recurso | Arquivo(s) |
|---------|-----------|
| Cadastro (nome, CNPJ, e-mail, telefone, categoria) | `apps/api/src/modules/suppliers/` |
| Auto-criação ao processar NF RECEBIDA | `fiscal-notes.service.ts` → `processFull()` |

### 4.12 WhatsApp (Chat Operacional)

| Recurso | Arquivo(s) |
|---------|-----------|
| Listagem de threads de conversas | `app/whatsapp/page.tsx` |
| Mensagens (IN/OUT) com mídia e link para NF | `app/whatsapp/actions.ts` → `sendMessage`, `uploadAttachment` |
| Envio de anexo que vira NF | `apps/api/src/modules/chat/` (a confirmar integração com canal real WhatsApp) |
| Modelo de dados | `schema.prisma` → `ChatThread`, `ChatMessage` |

> **Atenção:** O módulo gerencia threads e mensagens, mas a integração com a API real do WhatsApp Business (webhook/webhook sender) **não está visível no código** — pode ser um placeholder ou exigir configuração adicional.

### 4.13 Fiscal e Trabalhista (Simples Nacional)

| Recurso | Arquivo(s) |
|---------|-----------|
| DAS (Documento de Arrecadação Simples) por competência | `app/fiscal-trabalhista/page.tsx`; `apps/api/src/modules/tax-obligations/` |
| DEFIS (Declaração de Informações) | `schema.prisma` → `TaxObligationType` |
| Status: PENDENTE, PAGO, EM_ATRASO | `schema.prisma` → `ObligationStatus` |
| Folha de pagamento (cálculo FGTS, INSS, férias, eSocial) | `apps/api/src/modules/payroll/` |
| Status eSocial: PENDENTE, ENVIADO | `schema.prisma` → `EsocialStatus` |
| Funcionários (admissão, cargo, salário, status) | `schema.prisma` → `Employee` |

> **Atenção:** O envio real ao eSocial e o SEFAZ **não estão implementados** (a confirmar) — os campos de status existem no schema, mas o integrador externo é fase futura.

### 4.14 Exportação Contábil

| Recurso | Arquivo(s) |
|---------|-----------|
| Exportação por competência (XML / CSV / ZIP) | `app/contador/page.tsx`; `apps/api/src/modules/accounting/` |
| Formatos: ZIP (padrão), XML, CSV | `schema.prisma` → `ExportFormat` |
| Status: PENDENTE, GERADO, ENVIADO | `schema.prisma` → `ExportStatus` |
| Histórico de exportações | `GET /accounting/exports` |
| Documentos societários (contrato social, cert. digital, procuração, alvará) | `schema.prisma` → `CorporateDoc`; `apps/api/src/modules/corporate/` |

### 4.15 Inteligência Artificial (Módulo /inteligencia)

| Recurso | Arquivo(s) |
|---------|-----------|
| Copiloto financeiro (perguntas em linguagem natural) | `app/inteligencia/page.tsx`; `POST /ai/copilot` → `apps/api/src/modules/ai-insights/ai-insights.service.ts` |
| Previsão de fluxo de caixa (regressão linear, 3 meses ahead) | `GET /ai/forecast` → `ai-insights.service.ts` → `forecast()` |
| Detecção de anomalias (saldos negativos, outliers, vencimentos extremos) | `GET /ai/anomalies` → `ai-insights.service.ts` → `anomalies()` |
| Alertas automáticos (inadimplência, DAS, OCR pendente) | `GET /ai/alerts` → `ai-insights.service.ts` → `alerts()` |
| Resumo narrativo do mês (LLM) | `GET /ai/monthly-summary` → `ai-insights.service.ts` → `monthlySummary()` |
| Categorização de lançamentos (regex + LLM fallback) | `POST /ai/categorize` → `ai-insights.service.ts` → `categorize()` |

**Pipeline de categorização:** regras por regex (`CATEGORY_RULES`) → LLM se regra não casar → string fallback se LLM indisponível. Nunca bloqueia.

### 4.16 Painel do Cliente

| Recurso | Arquivo(s) |
|---------|-----------|
| Visão simplificada do cliente final | `app/painel-cliente/page.tsx`, `components/client-panel-screen.tsx` |
| Saldo, pendências, alertas (sem detalhes operacionais do BPO) | `client-panel-screen.tsx` |

### 4.17 Relatórios

| Recurso | Arquivo(s) |
|---------|-----------|
| Fluxo de caixa realizado vs previsto | `app/relatorios/page.tsx` |
| Categorias de despesas (barra horizontal) | `components/apex-chart.tsx` |

### 4.18 Configurações

| Recurso | Arquivo(s) |
|---------|-----------|
| Dados da empresa (nome, CNPJ, regime tributário) | `app/configuracoes/page.tsx` |
| Contas bancárias, categorias, usuários, regras | `components/module-overview.tsx` |

### 4.19 Aprovações

| Recurso | Arquivo(s) |
|---------|-----------|
| Fluxo de aprovação (PENDING → APPROVED / REJECTED) | `apps/api/src/modules/approvals/` |
| Aplicável a: FinancialEntry, Document | `schema.prisma` → `ApprovalRequest.targetType` |

### 4.20 Auditoria

| Recurso | Arquivo(s) |
|---------|-----------|
| Log de ações (CREATE, UPDATE, DELETE) por usuário/entidade | `apps/api/src/modules/audit/` |
| `GET /audit-logs` | `apps/api/src/modules/audit/` |

---

## 5. Integrações Externas

### 5.1 IA de Visão (OCR de Documentos)

**Arquivo:** `apps/api/src/modules/ai/ai-vision.service.ts`

| Provedor | Modelo padrão | Chave env | Uso |
|---------|-------------|-----------|-----|
| OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY` | OCR primário |
| Google Gemini | `gemini-1.5-flash` | `GEMINI_API_KEY` | Fallback OCR |

**Fluxo de fallback:**
1. Arquivo recebido (multipart upload)
2. Valida se é `image/*` — se não, retorna `source: MANUAL`
3. Tenta OpenAI → falha? tenta Gemini → falha? retorna `source: MANUAL`
4. Sem nenhuma chave configurada → `source: MANUAL`
5. `MANUAL` = status `NEEDS_REVIEW`, operador revisa manualmente

**Resultado IA:** `{ type, supplierName, supplierCnpj, issueDate, total, items[], confidence }`. Se `confidence >= 85`, status automático `APPROVED`.

### 5.2 LLM (Categorização, Copiloto, Resumo)

**Arquivo:** `apps/api/src/modules/ai/llm.service.ts`

- Default: **Ollama local** (`OLLAMA_HOST`, padrão `localhost:11434`)
- Fallback: sem LLM → cada serviço usa resposta determinística (nunca bloqueia)
- Chaves de cloud presentes em `.env` (xAI/Grok, DeepSeek) — integração com Ollama ou API cloud (a confirmar qual adapter é ativo)

### 5.3 PostgreSQL

- ORM: **Prisma 5.22**
- Configuração: `DATABASE_URL` em `apps/api/.env`
- Migrations: `prisma/migrations/` (a confirmar quantas migrations existem)
- Seed dev: `prisma/seed.ts` (destrutivo — limpa e recria tudo)
- Seed prod: `prisma/seed-simples.ts` (aditivo, idempotente)

### 5.4 Armazenamento de Arquivos

**Arquivo:** `apps/api/src/modules/documents/storage.service.ts`

- Arquivos salvos no sistema de arquivos local do VPS (a confirmar caminho base)
- `storagePath` salvo nos modelos `Document`, `FiscalNote`, `CorporateDoc`, `AccountingExport`
- Não há integração com S3 / cloud storage visível no código — storage é local **(a confirmar)**

### 5.5 Email / Notificações

- Não há integração de e-mail ou push notification visível no código-fonte **(a confirmar)**

### 5.6 Open Banking / Banco

- Não há integração com Open Banking, OFX/CNAB ou API bancária no código **(a confirmar)**
- `BankTransaction` é importada manualmente

---

## 6. Como Rodar

### Pré-requisitos
- Node.js 20+ (a confirmar)
- pnpm 9+
- PostgreSQL 14+ (local ou remoto)
- Variáveis de ambiente configuradas

### Configuração inicial

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar banco (backend)
# Criar apps/api/.env com:
#   DATABASE_URL=postgresql://user:senha@localhost:5432/angra_bpo
#   JWT_SECRET=sua_chave_secreta_aqui
#   PORT=3002

# 3. Gerar Prisma client
pnpm --filter @angra/api prisma:generate

# 4. Criar schema no banco
pnpm --filter @angra/api prisma:migrate

# 5. Popular com dados de demonstração
pnpm --filter @angra/api prisma:seed
```

### Desenvolvimento

```bash
# Frontend (porta 3001)
pnpm dev:web

# Backend (porta 3002)
pnpm dev:api

# Ambos simultâneos: abrir dois terminais separados
# (PowerShell 5.1 não suporta && entre processos)
```

Acesse: `http://127.0.0.1:3001` | API: `http://127.0.0.1:3002/api`

### Build

```bash
# Frontend
pnpm build

# Backend
pnpm build:api
```

### Typecheck e Lint

```bash
pnpm typecheck      # Frontend
pnpm typecheck:api  # Backend
pnpm lint           # ESLint (eslint-config-next)
```

> **Não há test runner configurado** em nenhum dos pacotes — não existe `pnpm test`.

### Deploy em Produção (VPS)

```bash
# Local: empacotar
pnpm install
pnpm build
pnpm build:api
tar czf ../bpo-angra.tar.gz .

# VPS: extrair e iniciar
scp bpo-angra.tar.gz root@62.171.181.241:/var/www/
# (na VPS)
cd /var/www && tar xzf bpo-angra.tar.gz -C bpo.angra.io
cd bpo.angra.io
pnpm install --frozen-lockfile
pnpm --filter @angra/api prisma:deploy   # Aplica migrations pendentes
pm2 restart bpo-web bpo-api
pm2 save
```

**Portas em produção:** frontend em `:5001`, backend em `:5002` (via PM2 `ecosystem.config.js`).  
nginx roteia `https://bpo.angra.io/` → `:5001` e `https://bpo.angra.io/api/` → `:5002`.

### Migrations Prisma

```bash
# Dev (cria arquivo .sql em prisma/migrations/)
pnpm --filter @angra/api prisma:migrate

# Prod (aplica migrations existentes sem criar novas)
pnpm --filter @angra/api prisma:deploy
```

---

## 7. Pontos de Atenção

### 7.1 Ausência de Testes Automatizados

Não existe `pnpm test`, nenhum framework de testes (Jest, Vitest, Playwright) está configurado. Toda verificação é manual ou via typecheck/lint. **Risco alto** para regressões em módulos interdependentes (ex.: processFull NF → FinancialEntry → CashEntry).

### 7.2 Armazenamento de Arquivos Local

Uploads de NF, documentos e exportações são salvos no filesystem do VPS. Se o servidor for substituído ou houver falha de disco, todos os arquivos são perdidos. Migração para S3 ou similar é necessária antes de escalar.

### 7.3 Integração WhatsApp Não Verificada

O módulo `/whatsapp` gerencia threads e mensagens no banco de dados, mas a conexão com um canal real do WhatsApp Business (webhook entrada, API de envio) **não está visível no código-fonte**. O módulo pode ser um placeholder esperando integração.

### 7.4 eSocial e SEFAZ Não Implementados

Os campos `esocialStatus` (PENDENTE/ENVIADO) existem no schema, mas o envio real ao eSocial e qualquer integração com SEFAZ (NF-e, NFC-e) **não estão implementados**. São pontos obrigatórios para formalidade fiscal.

### 7.5 Chaves de API Hardcoded em `.env` Raiz

O arquivo `.env` na raiz do repositório contém chaves de API reais (OpenAI, Gemini, xAI, DeepSeek, BrightData, Kondado) e credenciais SSH do VPS. Esse arquivo **deve estar no `.gitignore`** — verificar se não está versionado inadvertidamente.

### 7.6 JWT Implementado sem Biblioteca Criptográfica

`jwt.util.ts` implementa JWT HS256 usando `crypto` nativo do Node.js (sem `jsonwebtoken` ou `@nestjs/jwt`). Isso funciona, mas aumenta a superfície de risco de bugs de segurança sutil (timing attacks, validação de claims). Reconsiderar uso de lib estabelecida.

### 7.7 Sem Refresh Token

O JWT tem TTL de 8 horas e não há mecanismo de refresh. Após expirar, o usuário é redirecionado para `/login`. Em uso contínuo durante o dia, isso pode ser disruptivo.

### 7.8 Frontend Ainda com Fixtures de Fallback

Embora `lib/api.ts` já chame a API real, várias páginas ainda recorrem a `lib/data.ts` quando a API não responde. As fixtures de seed podem não corresponder ao estado real do banco — estados de loading e erros precisam ser revisados rota a rota.

### 7.9 Upload Direto via Server Action (Sem Validação de Tipo MIME no Frontend)

As server actions (`uploadNote`, `uploadAttachment`) enviam o arquivo diretamente para a API. A validação de tipo MIME e tamanho máximo ocorre apenas no backend (`ai-vision.service.ts`). Adicionar validação client-side melhora UX e reduz requests desnecessários.

### 7.10 Sem Monitoramento / Observabilidade

Não há APM, logging centralizado (ex.: Datadog, Sentry, Axiom) nem alertas de saúde nos processos PM2. Falhas silenciosas no backend (ex.: Prisma timeout, LLM indisponível) só são detectadas manualmente.

### 7.11 Deploy Manual via `scp`

O processo de deploy é manual (empacotar localmente → copiar via SCP → descompactar no VPS → reiniciar PM2). Não há CI/CD, portanto não há validação automática antes do deploy em produção.

### 7.12 `DISABLE_ALTCHA=true` em `.env.local`

O ALTCHA (CAPTCHA) está desativado via variável de ambiente. Se o ALTCHA for uma camada de proteção no formulário de login (contra bots/force brute), sua desativação precisa ser intencional e controlada — não deixar em produção.
