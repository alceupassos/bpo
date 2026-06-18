# Prompt para o Cursor Composer 2.5 (Continuar Trabalho BPO-Angra)

Você é um Engenheiro de Software Sênior atuando no monorepo **bpo-angra** (Next.js 15 / React 19 no frontend; NestJS 10 / Prisma / Postgres no backend).

O projeto acabou de ter a **Fase A (P0 Bloqueadores)** de segurança e os itens iniciais da **Fase B (P1)** concluídos e validados. Todas as alterações anteriores foram testadas com sucesso (typecheck, builds e specs de integração verdes) e commitadas individualmente no Git local.

## Seu Objetivo
Continuar a execução linear a partir do **Item 12** do plano contido em [promptantigravity.md](file:///c:/Users/Alceu Passos/angra/bpo.angra/promptantigravity.md).

Siga rigorosamente a Ordem de Execução Linear: **ler os arquivos indicados → fazer a edição mínima necessária → validar localmente → commit pequeno → passar para a próxima tarefa**.

## Status Atual do Repositório (Git)
Últimos commits concluídos:
1. `feat(decimal): P0.4 - Conversao de Float para Decimal e correcao dos services`
2. `feat(api): P0.6 - Exibir indicador de dados de demonstracao quando a API esta offline`
3. `feat(security): P1.7 - CORS restrito e throttler no login`
4. `feat(onboarding): P1.1 - Onboarding de novas empresas e gestores via backend e frontend`
5. `feat(auth): P1.3 - Redirecionamento por papel (role) e protecao de rotas no middleware`
6. `feat(ui): P1.2 - Exibir identidade do usuario logado (nome e papel) no header`
7. `feat(ui): P1.4 - Adicionar loading.tsx e error.tsx globais no App Router`

## Próximos Passos (Começar do Item 12 do promptantigravity.md)

### 1. Item 12 · `/aprovacoes` — Workflow de Aprovação
- **Contexto:** Ligar a página `/aprovacoes` com a API real do backend (módulo `approvals`).
- **Fazer:**
  - Auditar `app/aprovacoes/page.tsx` para fazer a chamada ao backend real (via `getApprovals()`).
  - Adicionar ações de aprovar/rejeitar chamando `apiPost` para os endpoints do backend.
  - Exibir o banner de demonstração `isDemo={apiErrorTracker().hasError}` se a API estiver offline.
- **Validação:** Garantir que o typecheck e build passam.

### 2. Item 13 · P1.6 — Conciliação Operável
- **Contexto:** Ligar a página `/conciliacao` com a API real do backend (módulo `bank-transactions`).
- **Fazer:**
  - Adicionar a ação de conciliar movimentos diretamente na UI chamando o backend real.
  - Exibir o banner de demonstração se a API falhar.

### 3. Item 14 · P1.5 — Ligar Fiscal/Contador à API Real
- **Contexto:** Integrar `/fiscal-trabalhista` e `/contador` (que hoje usam fixtures fixas) com a API do backend real (módulos `tax-obligations` e `payroll`).
- **Fazer:**
  - No frontend, substituir a importação das fixtures de dados estáticos pelas chamadas reais de API (`getTaxObligations`, `getPayrollRuns`, etc.).
  - Adicionar as server actions para gerar folha e pagar guias via API.

*(Siga subsequentemente para a Fase C e Fase D do promptantigravity.md)*

## Guardrails e Validação de cada passo
Após concluir cada item do plano:
1. Rode `pnpm typecheck` e `pnpm typecheck:api` para garantir ausência de erros de TypeScript.
2. Rode `pnpm build` e `pnpm build:api` para certificar que o build compila com sucesso.
3. Crie um **commit pequeno com mensagem clara em português** (ex.: `feat(approvals): Item 12 - Ligar aprovacoes a API real`).
4. **Não dê push** para a origem sem ordem explícita.
