# ajustes.md — O que falta para um MVP que sobrevive a um investidor de M&A

> Documento de auditoria honesta do estado **real do código** (não das docs, que estão
> desatualizadas). Gerado em 2026-06-18 a partir de leitura direta de `apps/api/src`,
> `app/`, `lib/`, `middleware.ts` e `prisma/schema.prisma`.
>
> **Para quem é isto:** o investidor é especialista em M&A — passa a vida comprando empresas
> e fazendo *due diligence*. Esse perfil não se impressiona com tela bonita; ele **abre o capô**:
> tenta logar, tenta criar um segundo cliente, pergunta "esses números são reais?", "como você
> isola os dados de um cliente do outro?", "cadê o controle de quem fez o quê?". Este arquivo
> lista, sem dó, tudo que precisa existir para ele **não desconfiar** do produto.

---

## 0. Veredito em uma frase

O projeto é um **protótipo bem-estruturado com backend real (Postgres + Prisma) e ~70% dos
fluxos persistindo dados de verdade** — mas hoje está **com a autenticação DESLIGADA**, **dinheiro
em ponto flutuante**, **senhas em texto puro** e **dados de todos os clientes visíveis entre si**.
É demoável numa rede controlada; **não é seguro mostrar a um investidor técnico sem corrigir os P0 abaixo**,
porque qualquer uma dessas coisas, se descoberta ao vivo, derruba a credibilidade da rodada inteira.

**Nota de prontidão atual:** MVP 6/10 · Segurança 3/10 · Pronto-para-vender 3/10.
**Meta para a reunião:** MVP 8/10 · Segurança 7/10 — alcançável corrigindo só os P0 + P1.

---

## 1. O que é REAL vs. FACHADA hoje (seja honesto com você mesmo)

### Funciona de ponta a ponta (persiste no banco) ✅
- **Caixa** (`/caixa`): abrir/fechar/movimentos/saldo — CRUD real.
- **Clientes** (`/clientes`): cadastro + cobrança por QR — persiste.
- **Produtos** (`/produtos`): catálogo + cadastro — persiste.
- **Notas fiscais** (`/notas`): upload → IA lê → revisão → lançar → cadastrar produtos — pipeline real.
- **WhatsApp/Chat** (`/whatsapp`): enviar mensagem + anexo→NF — persiste.
- **Dashboard, Contas a pagar/receber, Conciliação, Inteligência, Relatórios, Painel cliente, OCR**:
  leem dados **reais** da API (mas são só leitura).

### Fachada / só fixtures (NÃO persiste — risco de te queimar) ⚠️
- **`/fiscal-trabalhista`** — 100% dados hardcoded (`dasTaxRows`, folha mockada). Botão de export é fake.
- **`/contador`** — chat fake, export fake, tudo `useState`. Zero API.
- **`/conciliacao`** — só exibe; **não tem botão de conciliar** (sem ação). Parece operável, não é.
- **`/configuracoes`** — só leitura; não dá pra editar nada.
- **Qualquer página** quando a API falha: cai **silenciosamente** nas fixtures de `lib/data.ts`
  **sem avisar**. Ou seja: o investidor pode estar olhando dado de mentira achando que é real —
  e se ele perceber isso, é pior do que se você tivesse dito "isto é um mock".

---

## 2. 🔴 P0 — BLOQUEADORES (corrigir ANTES de qualquer reunião)

Estes são os que, se o investidor descobrir ao vivo, **encerram a conversa**.

### P0.1 — Autenticação está DESLIGADA (em dois lugares)
- **Backend:** `apps/api/src/modules/auth/jwt-auth.guard.ts` tem `return true;` fixo com comentário
  `// TODO: reativar login`. **Todos os endpoints estão abertos ao mundo.**
- **Frontend:** `middleware.ts` é um no-op (`return NextResponse.next()`) com o mesmo TODO. Qualquer
  pessoa abre qualquer rota sem logar.
- **Consequência direta:** não existe controle de acesso nenhum hoje.
- **Ajuste:** reativar o `JwtAuthGuard` (descomentar verificação do JWT), reativar o `middleware.ts`
  para exigir cookie válido, e **escrever 1 teste** que prova que rota protegida retorna 401 sem token.

### P0.2 — Vazamento entre clientes (multi-tenant quebrado)
- A arquitetura está certa (`companyId` indexado em tudo, função `companyScope()`), **mas** como o
  auth está desligado, `companyScope(undefined)` sempre retorna `null` → o filtro `where` some →
  **cliente A enxerga os dados financeiros do cliente B**.
- Para um produto de BPO financeiro multi-cliente, isto é o **pior pesadelo de DD** (LGPD + confiança).
- **Ajuste:** depende do P0.1. Depois de religar o auth, **escrever teste de isolamento**: usuário da
  empresa X chama `GET /financial-entries` e **não** pode ver linhas da empresa Y.

### P0.3 — Senhas em texto puro no banco
- `seed.ts` grava `passwordHash: "angra123"` literal; `auth.service.ts` compara direto. Apesar do nome
  da coluna, **não há bcrypt/argon2**.
- **Ajuste:** hashear com `bcrypt` (ou `argon2`) no cadastro e no login; re-seedar. ~2h de trabalho.

### P0.4 — Dinheiro em ponto flutuante (`Float`) — erro clássico de fintech
- **25+ colunas monetárias** são `Float` (`amount`, `balance`, `total`, `price`, `cost`, `fgts`,
  `inss`, `netPay`, `creditLimit`...). **Zero `Decimal`.** Em `Float`, `0.1 + 0.2 = 0.30000000000000004`.
- Num produto que **concilia banco e calcula folha**, isto gera diferença de centavos que **não fecha** —
  e um especialista financeiro testa exatamente isso.
- **Ajuste:** migrar colunas de dinheiro para `Decimal @db.Decimal(14,2)` no Prisma, ajustar os
  services para `Prisma.Decimal`/`decimal.js`. É a correção mais "barata" com maior retorno de credibilidade.

### P0.5 — Segredo do JWT hardcoded
- `auth.service.ts` e `jwt-auth.guard.ts` usam fallback `"dev-secret-change-me"`. Quem souber disso
  forja qualquer token.
- **Ajuste:** ler `JWT_SECRET` do ambiente e **falhar o boot** se não estiver setado (sem fallback).

### P0.6 — Tirar a "queda silenciosa para fixtures" da demo
- Hoje, API que falha → `return null` → tela mostra dado fake sem avisar (`lib/api.ts`).
- **Risco:** você demonstra "dado real" que na verdade é seed, o investidor cruza um número e percebe.
- **Ajuste mínimo para a demo:** ou (a) garantir que a API esteja 100% no ar e **remover o fallback**
  nas telas da demo, ou (b) colocar um selo visível "dados de demonstração" quando cair no fallback.
  Nunca deixe ambíguo.

---

## 3. 🟠 P1 — ESSENCIAIS DE MVP (o investidor vai testar isto)

### P1.1 — Onboarding de um novo cliente (empresa/tenant) pela interface
- Dá pra cadastrar **customer** (cliente do crediário), mas **não dá pra criar uma nova EMPRESA-cliente**
  do BPO pela UI. O investidor **vai** perguntar "como eu coloco o meu segundo cliente aqui?" e hoje a
  resposta é "no banco, na mão".
- **Ajuste:** tela de cadastro de empresa (CNPJ, regime, responsável) + criar o primeiro usuário dela.
  Este é o fluxo que prova que o produto **escala para N clientes**.

### P1.2 — Botão de logout + indicação de quem está logado
- `logoutAction` existe mas **não há botão** na UI. Mostrar "logado como Fulano (Operador BPO)" + logout.
- Parece bobo, mas a ausência grita "protótipo".

### P1.3 — Papéis de verdade (Operador BPO × Cliente da empresa)
- O produto **vende** o modelo de dois públicos, mas a UI é a mesma para todos: um cliente consegue
  abrir `/contador`, `/inteligencia` etc.
- **Ajuste:** após o login, redirecionar por papel (operador → `/`, cliente → `/painel-cliente`) e
  esconder/bloquear no `middleware.ts` as rotas que o cliente não pode ver. Usar o enum `Role` que já existe.

### P1.4 — Estados de carregando / vazio / erro visíveis
- Já existem componentes (`loading.tsx`, `empty-state.tsx`, `error.tsx`) mas o padrão atual é silencioso.
- **Ajuste:** quando a API falhar, **mostrar erro**, não esconder. Investidor prefere ver "indisponível"
  honesto a um número inventado.

### P1.5 — Terminar (ou esconder) as duas telas-fachada
- `/fiscal-trabalhista` e `/contador` estão puramente mockadas, e o backend **já tem** os módulos reais
  (`tax-obligations`, `payroll`, `accounting`). É só ligar a tela na API que já existe.
- **Ajuste:** ou ligar de verdade (preferível, o backend está pronto), ou **remover do menu** para a demo.
  Tela fake no meio de telas reais é o que faz o investidor "perder a fé" no resto.

### P1.6 — Conciliação operável (não só relatório)
- `/conciliacao` exibe transações mas não deixa conciliar. O backend tem o auto-matcher (Jaro-Winkler).
- **Ajuste:** botão "conciliar / aceitar sugestão / marcar divergência" chamando o endpoint que já existe.
  Conciliação bancária é **o coração** de um BPO financeiro — não pode ser só leitura.

### P1.7 — CORS restrito + rate limiting no login
- `main.ts` usa `cors: true` (qualquer origem). Sem throttling, `/auth/login` é força-bruta livre.
- **Ajuste:** CORS só para a origem do app (`APP_ORIGIN` do `.env`) + `@nestjs/throttler` no login.

---

## 4. 🟡 P2 — IMPORTANTES (perguntas de due diligence)

- **P2.1 — Log de auditoria automático.** Tabela `AuditLog` existe, mas o registro é manual/esparso.
  Para BPO, "quem aprovou esse pagamento e quando" é obrigatório. Pôr um *interceptor* que registra
  toda mutação (criar/editar/aprovar) com usuário, IP e timestamp.
- **P2.2 — Refresh token + tratamento de sessão expirada.** JWT expira em 8h sem refresh; ao expirar,
  hoje cai em fixtures sem avisar. Adicionar refresh + toast "sessão expirada, logue de novo".
- **P2.3 — LGPD (isto um investidor brasileiro de M&A cobra).** O sistema guarda **dado biométrico**
  (`Customer.faceDescriptor` — descritor facial = dado pessoal **sensível**, art. 11 LGPD), além de
  CPF/CNPJ e dados financeiros, **sem fluxo de consentimento, sem criptografia em repouso, sem política
  de retenção**. No mínimo: termo de consentimento na captura de biometria, criptografar o descritor,
  e um texto de política de privacidade. Sem isso, a empresa **não é comprável** (passivo regulatório).
- **P2.4 — Validação de params e autorização por recurso.** Endpoints como `POST /:id/approve` não
  validam se o `id` pertence à empresa do usuário. Validar UUID + checar dono do recurso.
- **P2.5 — Zero testes.** Não há **nenhum** `*.spec.ts`. Não precisa de 80% para a reunião, mas precisa
  de uma suíte mínima que cubra: login, isolamento multi-tenant, cálculo de saldo de caixa e cálculo de
  folha. Esses quatro testes "verdes" valem mais numa DD do que qualquer slide.
- **P2.6 — Documentação de API (Swagger/OpenAPI).** Não existe. NestJS gera com `@nestjs/swagger` quase
  de graça. Um `/api/docs` navegável transmite maturidade.
- **P2.7 — Higiene de segredos.** `.env` está git-ignored (bom), mas guarda **`SSH_PWD` (senha do
  servidor de produção)** e várias API keys em texto puro no mesmo arquivo do app. Tirar credencial de
  infra de dentro do `.env` da aplicação; planejar rotação das chaves de IA.
- **P2.8 — Reset de senha / primeiro acesso.** Não há "esqueci a senha" nem definição de senha no
  convite. Necessário antes de qualquer cliente real.

---

## 5. 🟢 P3 — DIFERENCIAIS QUE IMPRESSIONAM (se sobrar tempo)

- **Métricas de SaaS no próprio dashboard do operador:** nº de clientes ativos, documentos
  processados no mês, % conciliado automaticamente, SLA. Um comprador de empresa pensa em **unit
  economics** — mostrar que o produto se mede sozinho é um sinal forte. (Hoje alguns desses números no
  dashboard são hardcoded — vale torná-los reais.)
- **Trilha de "1 clique" ponta a ponta na demo:** subir uma NF real → IA lê → vira contas a pagar →
  baixa no caixa → aparece na conciliação. Esse fluxo único, funcionando de verdade, vende sozinho.
- **Exportação real para o contador** (o módulo `accounting` existe): gerar um ZIP de verdade de uma
  competência. Prova integração com o ecossistema contábil brasileiro.
- **Indicador "dados reais vs. demo"** explícito no rodapé durante a apresentação.

---

## 6. Roteiro sugerido para a reunião (como não tomar pergunta difícil)

1. **Logue na frente dele** (auth religada) — mostra que existe controle de acesso.
2. **Crie um cliente-empresa novo ao vivo** (P1.1) — responde "como escala?".
3. **Rode o fluxo NF → pagar → caixa → conciliar** com dado real (P3) — mostra o produto inteiro.
4. **Abra o painel do cliente em outro login** — mostra os dois públicos e o isolamento (P0.2 + P1.3).
5. **Mostre o `/api/docs` e a suíte de testes verde** (P2.5/P2.6) — mostra engenharia, não improviso.
6. Tenha pronta a frase: *"o que está com selo 'demo' ainda não está ligado; o resto persiste em
   Postgres"* — honestidade controlada vale mais que ser pego.

---

## 7. Checklist que o investidor de M&A provavelmente vai rodar (e a resposta hoje)

| O que ele testa | Hoje | Depois dos P0+P1 |
| --- | --- | --- |
| "Me deixa logar" | ❌ auth desligada | ✅ |
| "Cria um cliente novo aqui" | ❌ só no banco | ✅ |
| "Esses números batem?" | ⚠️ Float + fixtures | ✅ Decimal + dado real |
| "Cliente A vê dado do B?" | ❌ vê tudo | ✅ isolado + teste |
| "Quem aprovou isso?" | ⚠️ log esparso | ✅ auditoria automática |
| "E a LGPD da biometria?" | ❌ nada | ✅ consentimento + cripto |
| "Tem teste? Tem doc?" | ❌ zero | ✅ suíte mínima + Swagger |
| "Posso ver a folha calculada?" | ⚠️ tela fake | ✅ ligada ao backend real |

---

## 8. Ordem de ataque sugerida (esforço × impacto)

1. **Religar auth (P0.1) + isolamento (P0.2) + bcrypt (P0.3)** — meio bloco, maior impacto. ~1–2 dias.
2. **Float → Decimal (P0.4)** — alto impacto de credibilidade, esforço médio. ~1 dia.
3. **JWT secret + CORS + throttler (P0.5/P1.7)** — rápido. ~algumas horas.
4. **Onboarding de empresa + logout + papéis (P1.1/P1.2/P1.3)** — o que ele vai testar ao vivo. ~2 dias.
5. **Ligar fiscal-trabalhista/contador/conciliação na API que já existe (P1.5/P1.6)** — ~1–2 dias.
6. **Suíte mínima de testes + Swagger + auditoria (P2.1/P2.5/P2.6)** — selo de maturidade. ~2 dias.
7. **LGPD da biometria (P2.3)** — começar o quanto antes; é passivo, não feature.

> **Estimativa para chegar em "MVP 8/10, demoável e crível": ~2 a 3 semanas** de foco nos P0 e P1.
> Os P2/P3 podem ser apresentados como *roadmap* — investidor não espera tudo pronto, mas espera que
> você **saiba exatamente o que falta**. Este documento é essa prova.
