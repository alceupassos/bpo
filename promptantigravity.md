# promptantigravity.md — Mission brief para o agente Antigravity

> **Cole este arquivo inteiro como prompt inicial no Antigravity.** Ele é auto-contido:
> não depende de nenhuma conversa anterior. Deriva de `ajustes.md` (auditoria honesta do
> estado real do código, 2026-06-18), mas reescrito como **plano executável** com critérios
> de aceite. Sempre que houver dúvida entre este arquivo e a documentação antiga
> (`BPO.md`, `CLAUDE.md`, `next.md`), **confie no código-fonte real e neste brief**.

> **Alvo de execução: Antigravity IDE, modelo escolhido por item (estratégia híbrida de 3 tiers).**
> Cada item do backlog (seção 8) traz um selo **[Modelo: …]**. Três modelos disponíveis:
> **Gemini 3.1 Pro (high)** para raciocínio amplo/multi-arquivo, planejamento e revisão cruzada;
> **Sonnet 4.6** para edição cirúrgica de código crítico (dinheiro, auth, tenant, LGPD);
> **Gemini 3.5 Flash** para tarefas mecânicas de baixo risco. Legenda completa na seção 0.1.

---

## 0. Protocolo de execução neste IDE (LEIA ANTES DE TUDO)

Você está rodando como agente no **Antigravity IDE**. Trabalhe assim:

1. **Crie um plano/task list** a partir do backlog da seção 8 (um item = uma task). Use o painel
   de tarefas do Antigravity para acompanhar o progresso.
2. **Faça UM item por vez, em ordem (P0.1 → P0.2 → ...).** Não comece o próximo antes de fechar o atual.
3. **Para cada item, siga o ciclo:**
   a. Releia o item e seu critério de aceite.
   b. Abra e leia os arquivos citados ANTES de editar (não edite às cegas).
   c. Faça a alteração mínima que satisfaz o aceite.
   d. **Valide** (seção 5): `pnpm typecheck` + `pnpm typecheck:api` + build relevante; rode o spec se exigido.
   e. **Commit pequeno**, mensagem em português, um item por commit. **Sem push** (ver seção 10).
   f. Marque a task como concluída e passe para a próxima.
4. **Não estenda o escopo.** Faça exatamente o que o item pede — nada de refator "de brinde",
   troca de libs, ou mudança de direção visual. Escopo enxuto.
5. **Se algo estiver ambíguo ou bloquear** (ex.: falta `DATABASE_URL`, migration conflitante,
   decisão de produto), **pare e pergunte ao dono** em vez de adivinhar.
6. **Nunca invente** que algo funciona: só marque concluído depois de validar de verdade (typecheck/build/spec).
7. Se um item for grande (ex.: P0.4 Float→Decimal toca ~25 colunas), **quebre em sub-passos**
   no plano e valide entre eles.

### 0.1 Estratégia de modelo (híbrida, 3 tiers) — qual modelo usar por item

Cada item do backlog tem um selo de modelo. Antes de começar um item, **troque o modelo do
Antigravity para o indicado**:

- **[Modelo: Pro high]** — **Gemini 3.1 Pro (high)**, para **raciocínio amplo, multi-arquivo e de
  arquitetura**: o sweep `Float→Decimal` (schema + ~25 colunas + services + serialização), desenho da
  **suíte de testes**, **arquitetura LGPD**, e o **planejamento inicial** de todo o backlog. Também é o
  modelo da **revisão cruzada**: depois que o Sonnet fechar um P0 de segurança, rode uma passada de
  revisão com Pro high (modelo diferente pega erro que o autor não enxerga).
- **[Modelo: Sonnet 4.6]** — **edição cirúrgica** de código crítico de **correção/segurança/domínio**:
  autenticação, isolamento multi-tenant, regras de acesso, valores monetários. Onde seguir o critério de
  aceite à risca e mexer o mínimo importa mais que velocidade.
- **[Modelo: Flash OK]** — **Gemini 3.5 Flash**, para tarefas **mecânicas e de baixo risco**: fiação de
  UI já existente, botões, estados de loading/erro, listagens read-only, selos visuais.

> **Sobre "Sonnet 4.6" neste doc:** se o **Claude Opus 4.6** estiver disponível no Antigravity, **use
> Opus no lugar de Sonnet 4.6** — é o Claude mais forte. Sonnet 4.6 é a alternativa mais econômica.
> Onde estiver escrito "Sonnet 4.6", leia como "Opus 4.6 (ou Sonnet 4.6 se quiser economizar)".
> Tier do mais forte ao mais barato: **Opus 4.6 ≳ Gemini Pro 3.1 (high) > Sonnet 4.6 > Gemini Flash 3.5**.

Regras de ouro:
- **Na dúvida, suba o tier** (Flash → Sonnet → Opus/Pro high). Nunca use Flash em nada que altere
  valores monetários, regras de acesso ou escopo de empresa.
- **Itens com [Pro high ou Sonnet 4.6]** podem ser feitos em qualquer um dos dois (ambos top-tier);
  a recomendação indica a aptidão principal, não uma proibição.
- **Todo P0 deve receber uma revisão cruzada com Pro high** antes de ser marcado como concluído.
- Se um item "Flash OK" revelar lógica sensível no meio do caminho, **suba para Sonnet 4.6** antes de prosseguir.

---

## 1. Seu papel e sua missão

Você é um agente de engenharia sênior trabalhando no **bpo-angra**, um SaaS de **BPO financeiro**
(back-office financeiro) para pequenas empresas brasileiras do **Simples Nacional**. Dois públicos:
o **operador interno do BPO** e o **cliente final** (que acompanha as próprias finanças).

**Missão:** levar o produto de "protótipo bonito com auth desligada" para um **MVP crível e seguro**,
apresentável a um investidor especialista em M&A que vai fazer *due diligence* ao vivo (vai tentar
logar, criar um cliente novo, cruzar números, perguntar sobre isolamento de dados e LGPD).

Execute o backlog da seção 8 **em ordem de prioridade (P0 → P1 → P2 → P3)**. Não pule P0.
Trabalhe em commits pequenos e revisáveis, um item por commit.

---

## 2. Contexto do produto (resumo)

- Deliberadamente **não é um ERP** — mantenha enxuto e operacional.
- Direção visual atual: **Monetra claro** (fundo cinza claro, cards brancos, acento lime `#9fe870`,
  pills pretas `#111316`). Referência: `monetra.webp`. Isto **substitui** o dark do `BPO.md`.
- Contrato de design system: o Dashboard (`/`) é o pai; os outros módulos reusam os mesmos
  cards/tabelas/gráficos e só trocam dados/labels/contexto.
- Idioma de UI, labels e docs: **português** (frequentemente sem acentos). Siga a língua ao redor.

---

## 3. Stack e layout do monorepo

Monorepo **pnpm** (`pnpm-workspace.yaml`), dois pacotes:

- **Raiz (`.`)** — frontend **Next.js 15 / React 19** (App Router). Código em `app/`, `components/`, `lib/`.
- **`apps/api`** — backend **NestJS 10** sobre Express, prefixo global `/api`, bind em `127.0.0.1`.
  Banco **PostgreSQL via Prisma**. Schema em `apps/api/prisma/schema.prisma`.

Pontos de arquitetura que você precisa conhecer:
- Frontend chama o backend via `lib/api.ts` (server actions + `fetch`). Token JWT vai em cookie
  **httpOnly** (`bpo_token`), anexado como `Authorization: Bearer` por `getToken()`.
- Hoje há um *fallback silencioso*: se a API responde != 200, `apiGet` faz `return null` e a tela
  cai nas **fixtures** de `lib/data.ts` sem avisar. **Isso é um problema (ver P0.6).**
- Gráficos: sempre via `components/apex-chart.tsx` (wrapper `"use client"` que importa ApexCharts
  com `ssr:false`). Nunca importe ApexCharts direto.
- Ícones: referenciados por **nome string** em `lib/data.ts` e resolvidos em `components/icon-resolver.tsx`.
- Tokens de cor: classes Tailwind semânticas (`bg`, `surface`, `accent`, `danger`...) mapeadas a
  CSS vars em `app/globals.css`. Use as semânticas, não hex cru.
- Backend: cada domínio é um módulo NestJS (`*.module.ts` / `*.controller.ts` / `*.service.ts`),
  DTOs inline com `class-validator`. `PrismaService` é `@Global`.

---

## 4. Ambiente e comandos

Ambiente do dono: **Windows 11 + PowerShell** (sem `&&`/`||` encadeado nesse shell). Gerenciador: **pnpm**.
Todos os comandos a partir da raiz, salvo indicado.

| Tarefa | Comando |
| --- | --- |
| Frontend dev | `pnpm dev` (ou `pnpm dev:web` → `127.0.0.1:3001`) |
| Backend dev (watch) | `pnpm dev:api` → NestJS em `127.0.0.1:3002` |
| Build frontend | `pnpm build` |
| Build backend | `pnpm build:api` (tsc → `apps/api/dist`) |
| Typecheck frontend | `pnpm typecheck` |
| Typecheck backend | `pnpm typecheck:api` |
| Lint frontend | `pnpm lint` |
| Prisma generate | `pnpm --filter @angra/api exec prisma generate` |
| Criar migration | `pnpm --filter @angra/api exec prisma migrate dev --name <nome>` |
| Seed | rodar o script de seed em `apps/api/prisma/` (ver pacote) |

Notas:
- O root `tsconfig.json` **exclui** `apps/api`. Use `typecheck:api` para o backend.
- **Não existe test runner configurado ainda.** Parte do seu trabalho (P2.5) é configurar Jest
  no `apps/api` (NestJS já traz suporte) e escrever os primeiros specs.
- Deploy de produção é **VPS + nginx + PM2** (apps `bpo-api` e `bpo-web`), online em
  `https://bpo.angra.io`. **NÃO é Vercel.** Deploy só quando o dono pedir.

---

## 5. Como validar cada mudança (obrigatório antes de fechar um item)

1. `pnpm typecheck` **e** `pnpm typecheck:api` passam.
2. `pnpm build` passa (frontend) e `pnpm build:api` passa (backend).
3. Migrations Prisma são **aditivas e idempotentes** quando possível (não destrutivas em prod).
4. Para itens com critério de teste, o `*.spec.ts` correspondente roda verde.
5. Nenhum segredo novo hardcoded; nada commitado em `.env*`.

---

## 6. Estado REAL verificado (ponto de partida — não confie nas docs antigas)

**Funciona de ponta a ponta (persiste em Postgres):** Caixa (`/caixa`), Clientes (`/clientes`),
Produtos (`/produtos`), Notas fiscais (`/notas`, pipeline upload→IA→revisão→lançar), WhatsApp (`/whatsapp`).
**Só leitura, mas com API real:** Dashboard, Contas a pagar/receber, Conciliação, Inteligência,
Relatórios, Painel cliente, OCR.
**Fachada / só fixtures (NÃO persiste):** `/fiscal-trabalhista`, `/contador` (o backend real
`tax-obligations`/`payroll`/`accounting` JÁ EXISTE — é só ligar). `/conciliacao` é só leitura
(sem botão de conciliar, apesar do auto-matcher Jaro-Winkler existir no backend). `/configuracoes` só leitura.

**Backend (`apps/api`):** Postgres+Prisma reais; ~25 módulos; multi-tenancy via `companyId`
**arquitetada mas inerte** (auth off → `companyScope()` sempre retorna `null`). **Zero testes.**

---

## 7. Guardrails (regras que você NÃO pode violar)

- **Não quebre assinaturas de endpoint** existentes sem necessidade — o frontend depende delas.
- **Migrations aditivas**, idempotentes; nunca rode seed destrutivo (`deleteMany`) contra produção.
- **Nada de segredo hardcoded.** Ler de env; falhar o boot se faltar segredo crítico.
- **Não introduza Float para dinheiro.** Todo valor monetário é `Decimal`.
- Mantenha o **design system Monetra claro** e o padrão "mesmos componentes, dados diferentes".
- Todas as rotas devem continuar resolvendo (sem 404): `/`, `/contas-a-pagar`, `/contas-a-receber`,
  `/conciliacao`, `/ocr-documentos`, `/relatorios`, `/painel-cliente`, `/configuracoes`, `/caixa`,
  `/clientes`, `/produtos`, `/notas`, `/whatsapp`, `/inteligencia`, `/fiscal-trabalhista`, `/contador`, `/login`.
- Commits pequenos, mensagem em português, um item do backlog por commit. **Não faça push/PR sem o
  dono pedir.**

---

## 8. BACKLOG PRIORIZADO (execute nesta ordem)

### 🔴 P0 — Bloqueadores (fazer primeiro, sem exceção)

**P0.1 — Religar autenticação (backend + frontend)** · **[Modelo: Sonnet 4.6]**
- Arquivos: `apps/api/src/modules/auth/jwt-auth.guard.ts` (hoje tem `return true;` com `// TODO: reativar login`);
  `middleware.ts` na raiz (hoje no-op).
- Fazer: restaurar a verificação real do JWT no guard; restaurar o `middleware.ts` para exigir cookie
  `bpo_token` válido e redirecionar para `/login` quando ausente/expirado (deixar `/login` público).
- Aceite: chamada a endpoint protegido sem token → **401**; navegar a rota protegida sem cookie → redireciona a `/login`.
  Escrever 1 spec provando o 401.

**P0.2 — Isolamento multi-tenant (depende de P0.1)** · **[Modelo: Sonnet 4.6]**
- Contexto: `companyScope()` em `apps/api/src/modules/auth/current-user.decorator.ts` retorna `null`
  para admin/operador e `companyId` para cliente — mas com auth off o user é sempre `undefined`.
- Fazer: com auth religada, garantir que usuários `GESTOR_EMPRESA`/`FINANCEIRO_EMPRESA` só enxergam a
  própria empresa em **todos** os services que recebem `companyId`.
- Aceite: spec de isolamento — usuário da empresa X chama `GET /financial-entries` e **não** recebe
  linhas da empresa Y. Repetir o conceito para pelo menos: financial-entries, documents, fiscal-notes, cash.

**P0.3 — Hash de senha (bcrypt/argon2)** · **[Modelo: Sonnet 4.6]**
- Arquivos: `apps/api/src/modules/auth/auth.service.ts` (compara senha direto hoje); seed em `apps/api/prisma/`.
- Fazer: hashear no cadastro e validar no login com `bcrypt`; re-seedar usuários com hash.
- Aceite: nenhuma senha em texto puro no banco; login continua funcionando com as credenciais de seed.

**P0.4 — Dinheiro: `Float` → `Decimal`** · **[Modelo: Pro high]** (sweep amplo multi-arquivo; revisar com Sonnet 4.6)
- Arquivo: `apps/api/prisma/schema.prisma` — **25+ colunas** monetárias são `Float`, **zero `Decimal`**
  (`amount`, `balance`, `total`, `price`, `cost`, `openingAmount`, `closingAmount`, `creditLimit`,
  `fgts`, `inss`, `netPay`, `baseSalary`, `vacationDue`, `baseRevenue`, `unitPrice`, etc.).
- Fazer: migrar todas para `Decimal @db.Decimal(14,2)` (qtd de estoque pode ficar `Decimal(14,3)`);
  ajustar services para `Prisma.Decimal`/`decimal.js`; ajustar serialização para o frontend (string/number consistente).
- Aceite: typecheck:api passa; cálculo de saldo de caixa e de folha conferem ao centavo num spec.

**P0.5 — JWT secret sem fallback hardcoded** · **[Modelo: Sonnet 4.6]**
- Arquivos: `auth.service.ts`, `jwt-auth.guard.ts` (hoje fallback `"dev-secret-change-me"`).
- Fazer: ler `JWT_SECRET` do ambiente; **abortar o boot** se não estiver setado. Documentar em `.env.example`.
- Aceite: subir sem `JWT_SECRET` → app falha com erro claro; com a var → funciona.

**P0.6 — Eliminar a "queda silenciosa para fixtures"** · **[Modelo: Sonnet 4.6]**
- Arquivo: `lib/api.ts` (`apiGet` faz `return null` em erro → tela usa fixtures sem avisar).
- Fazer: nas telas, distinguir claramente dado real de indisponível. Mínimo: mostrar estado de erro
  (`error.tsx`/empty) em vez de fixture silenciosa; OU exibir selo "dados de demonstração" quando em fallback.
- Aceite: com a API derrubada, a tela mostra erro/selo — nunca um número fake disfarçado de real.

### 🟠 P1 — Essenciais de MVP (o investidor vai testar)

**P1.1 — Onboarding de empresa-cliente (tenant) pela UI** · **[Modelo: Sonnet 4.6]** (cria tenant/usuário → afeta escopo)
- Fazer: tela + endpoint para criar **Company** (CNPJ, regime, nome) e seu primeiro usuário
  (`GESTOR_EMPRESA`). Modelo `Company`/`User` já existem no schema.
- Aceite: operador cria uma empresa nova pela interface e ela passa a aparecer/escopar dados.

**P1.2 — Botão de logout + identidade do usuário logado** · **[Modelo: Flash OK]**
- Fazer: `logoutAction` já existe em `app/login/actions.ts` (sem botão). Adicionar botão no shell +
  "logado como Fulano (Papel)".
- Aceite: logout limpa cookie e volta a `/login`.

**P1.3 — Papéis reais (Operador BPO × Cliente)** · **[Modelo: Sonnet 4.6]** (regra de acesso)
- Fazer: após login, redirecionar por `Role` (operador → `/`, cliente → `/painel-cliente`); no
  `middleware.ts`, bloquear rotas internas para papéis de cliente.
- Aceite: usuário cliente não acessa `/contador`, `/inteligencia` etc.

**P1.4 — Estados de loading/empty/error visíveis** · **[Modelo: Flash OK]**
- Fazer: usar `loading.tsx`/`empty-state.tsx`/`error.tsx` (já existem) nas telas; nada de erro silencioso.

**P1.5 — Ligar `/fiscal-trabalhista` e `/contador` à API real** · **[Modelo: Sonnet 4.6]** (mostra valores de folha/fiscal)
- Contexto: backend `tax-obligations`, `payroll`, `accounting` já existe; telas estão 100% mockadas.
- Fazer: trocar fixtures por chamadas reais via `lib/api.ts`. Se faltar tempo, **esconder do menu** em vez de deixar fake.
- Aceite: telas mostram dados do banco; export do contador gera artefato real.

**P1.6 — Conciliação operável** · **[Modelo: Sonnet 4.6]** (mexe em valores/matching)
- Fazer: em `/conciliacao`, adicionar ações (conciliar / aceitar sugestão / marcar divergência)
  chamando o auto-matcher existente no módulo `banking`.
- Aceite: usuário concilia uma transação e o status persiste.

**P1.7 — CORS restrito + rate limiting no login** · **[Modelo: Sonnet 4.6]** (segurança)
- Arquivo: `apps/api/src/main.ts` (`cors: true` hoje).
- Fazer: CORS só para `APP_ORIGIN` (env); adicionar `@nestjs/throttler` no `/auth/login`.
- Aceite: origem estranha é barrada; brute-force no login é limitado.

### 🟡 P2 — Importantes (perguntas de due diligence)

- **P2.1 — Auditoria automática · [Modelo: Sonnet 4.6]:** interceptor NestJS que grava em `AuditLog`
  toda mutação (criar/editar/aprovar) com usuário, ação, entidade, timestamp.
- **P2.2 — Refresh token + sessão expirada · [Modelo: Sonnet 4.6]:** refresh do JWT e toast
  "sessão expirada" no frontend.
- **P2.3 — LGPD (crítico para investidor BR) · [Modelo: Pro high]** (arquitetura/decisão; implementar com Sonnet 4.6)**:** `Customer.faceDescriptor` é
  **dado biométrico sensível** (art. 11 LGPD). Adicionar consentimento na captura, criptografar o
  descritor em repouso, política de retenção + texto de privacidade. Passivo regulatório — começar cedo.
- **P2.4 — Validação de params + autorização por recurso · [Modelo: Sonnet 4.6]:** endpoints `:id`
  (ex. `POST /:id/approve`) devem validar UUID e checar se o recurso pertence à empresa do usuário.
- **P2.5 — Suíte mínima de testes · [Modelo: Pro high]** (desenho da estratégia; escrever specs com Sonnet 4.6)**:** configurar Jest no `apps/api`; cobrir login,
  isolamento multi-tenant, saldo de caixa e cálculo de folha (os 4 specs que mais valem numa DD).
- **P2.6 — Swagger/OpenAPI · [Modelo: Flash OK]:** `@nestjs/swagger` expondo `/api/docs`.
- **P2.7 — Higiene de segredos · [Modelo: Sonnet 4.6]:** tirar credencial de infra (`SSH_PWD`) de dentro
  do `.env` da app; planejar rotação das API keys de IA. Atualizar `.env.example`.
- **P2.8 — Reset de senha / primeiro acesso · [Modelo: Sonnet 4.6]:** fluxo "esqueci a senha" +
  definição de senha no convite.

### 🟢 P3 — Diferenciais (se sobrar tempo)

- **P3.1 — Métricas SaaS reais no dashboard do operador · [Modelo: Sonnet 4.6]** (clientes ativos,
  docs/mês, % conciliado automático, SLA) — hoje alguns são hardcoded; torná-los reais (cálculo correto importa).
- **P3.2 — Fluxo "1 clique" ponta a ponta · [Modelo: Sonnet 4.6]** demoável: NF real → contas a pagar →
  baixa no caixa → aparece na conciliação (toca valores e múltiplos módulos).
- **P3.3 — Exportação real para o contador · [Modelo: Sonnet 4.6]** (ZIP de uma competência via módulo `accounting`).
- **P3.4 — Indicador explícito "dados reais vs. demo" · [Modelo: Flash OK]** no rodapé durante apresentações.
- **P3.5 — Padrão de "Insight IA" seletivo (NÃO preditivo em toda página) · [Modelo: Sonnet 4.6]:**
  Criar **um** componente reutilizável (ex.: `components/ai-insight-card.tsx`) que mostra um insight/alerta
  da IA **somente quando há algo útil E confiável a dizer** naquela tela — e fica **invisível** quando não há.
  Usar a infra que já existe (`/inteligencia`, módulo `ai-insights`: forecast, anomalias, alertas, categorização).
  Concentrar a IA só nestes 4 pontos de alto valor (não espalhar por todas as 17+ telas):
  1. **Dashboard + Contas a pagar/receber** → previsão de **fluxo de caixa** ("vai faltar caixa em X?").
  2. **Conciliação / Contas a pagar** → **anomalia / pagamento duplicado / valor fora do padrão**.
  3. **Contas a receber / Clientes (crediário)** → **risco de inadimplência** do cliente.
  4. **Notas / OCR** → **categorização automática** (já existe) do documento lido.
  Regras do componente: sempre rotular confiança ("projeção", "baixa confiança / poucos dados"); nunca
  fingir certeza; degradar para nada quando o backend de IA não responder (sem inventar número).
  Aceite: o card aparece nas 4 telas listadas com dado real; some quando não há insight; nenhuma outra
  tela ganha widget preditivo.

---

### 🆕 P-NEW — Páginas que faltam (criar do zero; backend já existe)

Estas rotas **não existem no frontend hoje**, mas os módulos de backend correspondentes **já estão
prontos** — então são telas de alto retorno e baixo risco de "inventar". Adicionar nav/rotas em
`lib/data.ts` + ícone em `components/icon-resolver.tsx`, e reusar o design system Monetra (mesmos
componentes, dados diferentes). **Todas respeitam o escopo de empresa (P0.2) e os papéis (P1.3).**

| Rota nova | Backend que já existe | Por que é importante (visão M&A) | Prioridade | Modelo |
| --- | --- | --- | --- | --- |
| **`/empresas`** | `companies` | Gestão das **empresas-cliente** do BPO + **seletor de empresa ativa** no topo. É a prova viva de que o produto é multi-cliente e escala. Casa com o onboarding do P1.1. | **P1** | **Sonnet 4.6** (escopo/tenant) |
| **`/aprovacoes`** | `approvals` | Fluxo de **aprovação de pagamentos** pelo cliente (workflow central de um BPO: operador solicita → cliente aprova). Hoje só o `/painel-cliente` lê aprovações; falta a tela operacional. | **P1** | **Sonnet 4.6** (decide sobre dinheiro) |
| **`/usuarios`** | `users` | Gestão de **usuários e papéis** (convidar, definir Role, desativar). Sustenta a história de RBAC que o investidor vai cobrar. | **P2** | **Sonnet 4.6** (acesso) |
| **`/auditoria`** | `audit` (`AuditLog`) | Trilha **"quem fez o quê e quando"**. Forte sinal de maturidade em DD. Só leitura. Casa com o interceptor do P2.1. | **P2** | **Flash OK** (listagem read-only) |
| **`/fornecedores`** | `suppliers` | Cadastro de **fornecedores** (auto-criados das NFs hoje, mas sem tela para ver/editar). Completa o ciclo de contas a pagar. | **P2** | **Flash OK** (CRUD simples) |
| **`/societario`** | `corporate` (`CorporateDoc`) | Documentos **societários**: contrato social, certificado digital, procuração, alvará — com **alerta de validade/vencimento**. Diferencial de BPO completo. | **P2** | **Flash OK** (docs + datas) |
| **`/perfil`** | `auth`/`users` | Conta do usuário logado: **trocar senha**, dados básicos. Casa com o reset de senha do P2.8. | **P2** | **Sonnet 4.6** (segurança) |

> Observação: **folha de pagamento** e **obrigações fiscais (DAS/DEFIS)** já têm destino — são o conteúdo
> real de `/fiscal-trabalhista` (hoje mockada). Não criar rota nova; ligá-la à API no **P1.5**.
> **Estoque** (movimentos) pode ficar dentro de `/produtos`; criar rota separada só se a tela ficar pesada.

---

## 9. Definition of Done (global)

Um item só está "pronto" quando: typecheck (front+api) verde · build (front+api) verde · sem segredo
hardcoded · migration aditiva aplicável · spec correspondente (quando exigido) verde · rotas todas
resolvendo · commit pequeno em português descrevendo o item.

**Meta da entrega:** MVP **8/10**, Segurança **7/10** — alcançável concluindo **P0 + P1**.
P2/P3 podem ser apresentados como roadmap. Estimativa de foco: **~2 a 3 semanas**.

---

## 10. O que NÃO fazer

- Não dar push, abrir PR ou fazer deploy sem o dono pedir explicitamente.
- Não rodar seed destrutivo contra a VPS/produção.
- Não reintroduzir `Float` para dinheiro nem segredos hardcoded.
- Não transformar o produto em ERP (escopo enxuto, operacional).
- Não trocar a direção visual (Monetra claro permanece).
- Não confiar em `BPO.md`/`CLAUDE.md`/`next.md` quando divergirem do código — o código e este brief mandam.
- **Não colocar IA preditiva em toda página.** Previsão fraca/errada na frente de um especialista
  financeiro destrói a credibilidade do produto inteiro. IA só nos 4 pontos do P3.5, sempre com rótulo
  de confiança, e calada quando não há dado/insight confiável. Seletiva e correta > onipresente e tremida.

---

## 11. Ordem de execução linear (siga esta sequência)

Execute **de cima para baixo**, **um item por vez**, seguindo o ciclo do Protocolo (seção 0):
ler → editar mínimo → validar (typecheck/build/spec) → commit pequeno → marcar concluído → próximo.
Troque o modelo do Antigravity conforme o selo de cada linha. **Todo item P0 recebe revisão cruzada
com Pro high antes de fechar.** Pare e pergunte ao dono se algo bloquear.

**Fase A — Base de segurança e integridade (P0, inegociável)**
1. P0.1 — Religar auth (backend + middleware) · *Sonnet 4.6*
2. P0.3 — Hash de senha (bcrypt) · *Sonnet 4.6*
3. P0.5 — JWT secret sem fallback · *Sonnet 4.6*
4. P0.2 — Isolamento multi-tenant + spec de isolamento · *Sonnet 4.6*
5. P0.4 — Float → Decimal (sweep schema + services) · *Pro high* (revisar com Sonnet 4.6)
6. P0.6 — Eliminar queda silenciosa para fixtures · *Sonnet 4.6*

**Fase B — MVP demoável (P1 + páginas P1)**
7. P1.7 — CORS restrito + throttler no login · *Sonnet 4.6*
8. P1.1 + página `/empresas` — onboarding e gestão de empresas-cliente + seletor de empresa · *Sonnet 4.6*
9. P1.3 — Papéis reais (operador × cliente) + guarda de rota · *Sonnet 4.6*
10. P1.2 — Botão de logout + identidade do usuário · *Flash OK*
11. P1.4 — Estados de loading/empty/error visíveis · *Flash OK*
12. Página `/aprovacoes` — workflow de aprovação de pagamento · *Sonnet 4.6*
13. P1.6 — Conciliação operável (ações de conciliar) · *Sonnet 4.6*
14. P1.5 — Ligar `/fiscal-trabalhista` e `/contador` à API real · *Sonnet 4.6*

**Fase C — Maturidade / due diligence (P2 + páginas P2)**
15. P2.1 + página `/auditoria` — interceptor de auditoria + tela da trilha · *Sonnet 4.6 (tela: Flash OK)*
16. P2.4 — Validação de params + autorização por recurso · *Sonnet 4.6*
17. P2.5 — Suíte mínima de testes (login, tenant, caixa, folha) · *Pro high* (specs com Sonnet 4.6)
18. P2.2 — Refresh token + sessão expirada · *Sonnet 4.6*
19. P2.8 + página `/perfil` — reset de senha / primeiro acesso + conta do usuário · *Sonnet 4.6*
20. Página `/usuarios` — gestão de usuários e papéis · *Sonnet 4.6*
21. P2.6 — Swagger/OpenAPI em `/api/docs` · *Flash OK*
22. P2.7 — Higiene de segredos (tirar `SSH_PWD` do `.env` da app, `.env.example`) · *Sonnet 4.6*
23. Página `/fornecedores` · *Flash OK*
24. Página `/societario` (docs societários + alerta de validade) · *Flash OK*
25. P2.3 — LGPD da biometria (consentimento + cripto + retenção) · *Pro high* (implementar com Sonnet 4.6)

**Fase D — Diferenciais (P3, se sobrar tempo)**
26. P3.5 — Componente de Insight IA seletivo (4 pontos) · *Sonnet 4.6*
27. P3.1 — Métricas SaaS reais no dashboard · *Sonnet 4.6*
28. P3.2 — Fluxo "1 clique" ponta a ponta · *Sonnet 4.6*
29. P3.3 — Exportação real para o contador · *Sonnet 4.6*
30. P3.4 — Selo "dados reais vs. demo" · *Flash OK*

> **Marco de "demoável para o investidor": ao terminar a Fase B** (itens 1–14) você tem MVP ~8/10,
> seguro e crível. Fases C e D elevam para nível de due diligence; podem ser apresentadas como roadmap.
```
