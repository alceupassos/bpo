# BPO SaaS Simples Nacional

## Resumo executivo

Sistema de BPO financeiro simples para empresas do Simples Nacional, com contas a pagar e receber, conciliacao bancaria, OCR de documentos, classificacao basica por IA, relatorios gerenciais simples e painel de acompanhamento para o cliente.

Em uma frase:

> O produto deve ser leve, operacional e automatizado, focado no basico que resolve o dia a dia financeiro sem transformar o sistema em ERP.

---

## Objetivo do MVP

Entregar em 30 dias um MVP funcional de um SaaS interno de BPO financeiro B2B, com experiencia dark inspirada diretamente no layout de referencia anexado, mas com informacoes, labels e contexto adaptados para operacao financeira de pequenas empresas do Simples Nacional.

O MVP precisa servir dois publicos:

- Operador interno do BPO
- Cliente final que acompanha seu financeiro

O MVP nao deve tentar resolver contabilidade, fiscal pesado ou operacoes tipicas de ERP completo.

---

## O que entra no MVP

### 1. Contas a pagar

- Cadastro de contas
- Vencimento
- Aprovacao
- Baixa apos pagamento
- Anexo do comprovante

### 2. Contas a receber

- Lancamento de recebiveis
- Controle de vencimento
- Baixa manual ou automatica simples
- Alertas de atraso

### 3. Conciliacao basica

- Conciliacao bancaria
- Conciliacao de caixa
- Conciliacao de cartao
- Diferencas e pendencias

### 4. OCR de documentos

- Leitura de boletos, notas e recibos
- Extracao de valor, data e fornecedor
- Envio para revisao automatica
- Classificacao simples por categoria

### 5. Relatorios basicos

- Fluxo de caixa
- Contas vencidas e a vencer
- Entradas e saidas do mes
- Resumo por categoria

### 6. Painel do cliente

- Lista de pendencias
- Aprovacoes
- Historico de pagamentos
- Resumo do mes

---

## O que fica fora do MVP

- ERP completo
- Estoque avancado
- Fiscal pesado
- Multi-filial
- Permissoes complexas
- Folha de pagamento
- Emissao fiscal completa
- Plano de contas profundo
- Contabilidade completa
- CRM comercial
- Open banking
- Automacoes bancarias profundas

---

## Principios de produto

- Operacional antes de analitico
- Simples antes de flexivel
- Assistido por IA, nunca dependente de IA
- Melhor rotina financeira do que "mais um ERP"
- Mesmo design system em todas as telas
- Os componentes visuais se repetem; mudam dados, labels e contexto

---

## Direcao visual obrigatoria

### Referencia principal

Usar o layout do anexo `1187e7746ce71446e57c609ac39a8b10.webp` como base visual principal.

Nao copiar o dominio e-commerce do mock. Copiar a anatomia:

- shell central escuro e arredondado
- rail lateral vertical com icones
- navegacao horizontal em pills no topo
- titulo forte no corpo principal
- calendario ou card de rotina no lado esquerdo
- blocos pequenos de KPI no centro
- grafico principal grande ocupando a base
- coluna direita com cards empilhados

### Design system

O produto deve ser dark, mesmo mantendo as cores institucionais fornecidas como base de tom.

#### Paleta base

- Navy: `#17345A`
- Texto: `#1B1E24`
- Cinza: `#7E8A9A`
- Linha: `#D7DEE8`
- Fundo suave: `#EEF3F9`
- Alerta: `#8A3A2B`

#### Adaptacao para o layout dark

- Fundo externo: usar `#EEF3F9` em tom suave apenas fora do shell principal
- Shell principal: preto ou quase preto
- Superficies internas: preto esverdeado/cinza escuro
- Borda: fina, fria e discreta
- Destaques: navy `#17345A` e variações frias
- Alerta: `#8A3A2B`
- Textos internos no shell: brancos ou cinza frio claro

#### Tipografia

- Titulos curtos, fortes e limpos
- Interface sem exagero editorial
- Nada com cara de landing page
- Nada com cara de dashboard genérico colorido

#### Movimento

Usar Framer Motion apenas para:

- entrada suave de paineis
- expansao de linhas e drawers
- estados de carregamento
- hover sutil de cards e pills

Sem exagero.

---

## Estrutura do produto

### Shell da aplicacao

- Sidebar vertical discreta
- Topbar limpa com navegacao por pills
- Campo de busca
- Avatar/status do operador
- Grid principal com:
  - coluna esquerda de rotina
  - centro operacional
  - coluna direita de leitura rapida

### Telas obrigatorias

- Dashboard Geral
- Contas a Pagar
- Contas a Receber
- Conciliacao
- OCR e Documentos
- Relatorios
- Painel do Cliente
- Configuracoes Minimas

---

## Conteudo de cada tela

### 1. Dashboard Geral

#### Objetivo

Ser o command center do BPO.

#### KPIs

- Saldo projetado D+30
- A pagar em aberto
- A receber em aberto
- Inadimplencia
- OCR pendente
- Conciliacao pendente
- SLA medio
- Automacao

#### Blocos obrigatorios

- Calendario ou agenda operacional
- 4 cards KPI principais
- 4 cards KPI secundarios
- Grafico principal de fluxo de caixa
- Coluna direita com:
  - carteira ativa
  - card operacional
  - despesas semanais
  - alertas
  - ultimas movimentacoes

#### Graficos

- Fluxo de caixa: bar/area principal
- Pagar por status: donut
- Receber por status: donut
- Top categorias: barra horizontal
- Volume processado: barra simples

#### Acoes

- Importar documentos
- Novo lancamento
- Conciliar
- Cobrar
- Exportar posicao

### 2. Contas a Pagar

- Foco em agenda, aprovacao e baixa
- Tabela principal:
  - fornecedor
  - documento
  - categoria
  - vencimento
  - valor
  - status
  - empresa
  - responsavel
- Graficos:
  - vencimentos por semana
  - status em donut
  - top fornecedores

### 3. Contas a Receber

- Foco em aging, follow-up e previsao
- Tabela principal:
  - cliente
  - fatura
  - emissao
  - vencimento
  - valor
  - saldo
  - status
  - cobranca
- Graficos:
  - recebimento diario
  - aging
  - maiores clientes

### 4. Conciliacao

- Foco em resolucao de pendencias
- Grade dupla:
  - extrato/importacao
  - lancamento sugerido
- Excecoes:
  - divergencia de valor
  - divergencia de data
  - duplicidade
  - sem correspondencia
- Graficos:
  - conciliado x pendente x divergente
  - pendencias por conta

### 5. OCR e Documentos

- Biblioteca de documentos
- Fila de revisao manual
- Estados:
  - uploaded
  - needs_review
  - approved
  - rejected
- Campos extraidos:
  - valor
  - data
  - fornecedor
  - categoria sugerida
  - tipo

### 6. Relatorios

- Fluxo de caixa
- Realizado x previsto
- Contas vencidas e a vencer
- Entradas e saidas do mes
- Resumo por categoria
- Exportacao simples

### 7. Painel do Cliente

- Resumo do mes
- Pendencias
- Aprovacoes
- Historico de pagamentos
- Documentos enviados
- Sem expor complexidade interna do BPO

### 8. Configuracoes Minimas

- Empresa
- Contas bancarias
- Categorias
- Usuarios
- Regras simples de aprovacao
- Canais de envio de documentos

---

## Stack tecnica obrigatoria

### Frontend

- Next.js
- Tailwind CSS
- Framer Motion
- ApexCharts como padrao
- ECharts somente se alguma visualizacao densa realmente exigir

### Backend

- NestJS

### Banco

- PostgreSQL

### OCR e IA

- Hugging Face plugavel
- Fallback manual obrigatorio

---

## Arquitetura funcional

### Modulos backend

- `auth`
- `companies`
- `users`
- `documents`
- `financial-entries`
- `banking`
- `approvals`
- `dashboard`
- `audit`

### Entidades minimas

- Company
- User
- CompanyUser
- BankAccount
- Document
- DocumentExtraction
- FinancialEntry
- BankTransaction
- Reconciliation
- ApprovalRequest
- AuditLog

### Estados minimos

#### Documento

- `UPLOADED`
- `NEEDS_REVIEW`
- `APPROVED`
- `REJECTED`

#### Lancamento

- `DRAFT`
- `PENDING_APPROVAL`
- `APPROVED`
- `PAID`
- `RECEIVED`

#### Conciliacao

- `IMPORTED`
- `SUGGESTED_MATCH`
- `RECONCILED`

### Perfis minimos

- Admin da plataforma
- Operador BPO
- Gestor da empresa
- Financeiro da empresa

---

## Endpoints essenciais

- `POST /auth/login`
- `GET /auth/me`
- `GET /dashboard/summary`
- `GET /dashboard/cashflow`
- `GET /financial-entries`
- `POST /financial-entries`
- `PATCH /financial-entries/:id`
- `POST /financial-entries/:id/mark-paid`
- `POST /financial-entries/:id/mark-received`
- `POST /documents/upload`
- `GET /documents`
- `POST /documents/:id/process`
- `POST /documents/:id/review`
- `POST /bank-transactions/import`
- `GET /bank-transactions`
- `POST /reconciliations/suggest`
- `POST /reconciliations/confirm`
- `GET /approvals`
- `POST /approvals/:id/approve`
- `POST /approvals/:id/reject`
- `GET /audit-logs`

---

## Seeds obrigatorios

### Empresas demo

- 2 a 3 empresas do Simples Nacional

### Dados iniciais

- 60 lancamentos a pagar
- 40 lancamentos a receber
- 30 documentos
- 20 conciliacoes concluidas
- 8 aprovacoes pendentes
- 10 itens em revisao

### KPIs seed

- saldo atual
- saldo projetado
- pagar na semana
- receber na semana
- fluxo previsto 30 dias
- taxa de conciliacao
- tempo medio de processamento

---

## Variaveis de ambiente

### Backend `.env`

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STORAGE_PROVIDER`
- `STORAGE_BUCKET`
- `HF_API_KEY`
- `HF_MODEL_OCR`
- `HF_MODEL_CLASSIFICATION`

### Frontend `.env.local`

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`

### Regra

Nao hardcodar segredos.
Se Hugging Face nao estiver configurado, o fluxo de OCR deve continuar com revisao manual.

---

## Roadmap de 30 dias

### Semana 1

- bootstrap do projeto
- auth
- banco
- migrations
- seed inicial
- shell do produto
- CRUD de contas a pagar
- CRUD de contas a receber

### Semana 2

- upload de documentos
- OCR plugavel
- fila de revisao
- importacao de extrato
- conciliacao basica

### Semana 3

- dashboard geral
- relatorios basicos
- painel do cliente
- refinamento visual

### Semana 4

- hardening
- testes funcionais
- testes visuais
- ajuste de responsivo
- seed final
- ambiente de demo

---

## Criterios de aceite

- Operador consegue usar pagar, receber, OCR, conciliacao e relatorios
- Cliente ve apenas seus proprios dados
- OCR ajuda, mas nao bloqueia operacao
- Conciliacao tem rastreabilidade
- Dashboard reflete os mesmos dados das tabelas
- Visual segue o layout dark do anexo
- As telas compartilham o mesmo design system
- O produto parece software operacional de BPO, nao ERP

---

## Prompt pronto para o `@feature-dev`

```md
Voce vai implementar um SaaS interno de BPO financeiro simples para empresas do Simples Nacional.

## Objetivo

Construir um MVP em 30 dias usando:

- Next.js
- Tailwind CSS
- Framer Motion
- ApexCharts como padrao
- ECharts apenas se alguma visualizacao realmente exigir
- NestJS
- PostgreSQL
- Hugging Face plugavel para OCR/classificacao

## Regra mais importante

O layout deve seguir o mais perto possivel do anexo de referencia dark.

Nao copiar o conteudo de e-commerce.
Copiar a anatomia visual:

- shell dark central grande e arredondado
- rail lateral vertical com icones
- navegacao superior horizontal em pills
- titulo forte no topo do corpo
- calendario ou card de rotina no bloco esquerdo
- cards KPI pequenos no centro
- grafico principal grande na metade inferior esquerda
- coluna direita com cards empilhados

## Paleta

- Navy: #17345A
- Texto: #1B1E24
- Cinza: #7E8A9A
- Linha: #D7DEE8
- Fundo suave: #EEF3F9
- Alerta: #8A3A2B

Como o shell principal e dark, adapte essas cores assim:

- exterior suave com #EEF3F9
- interior do app em preto/cinza escuro
- acentos em navy e azul frio
- alertas em #8A3A2B
- textos internos claros

## Produto

O sistema deve ser leve, operacional e automatizado, focado no basico sem virar ERP.

### Modulos obrigatorios

1. Contas a pagar
2. Contas a receber
3. Conciliacao basica
4. OCR e documentos
5. Relatorios basicos
6. Painel do cliente
7. Configuracoes minimas

## Dashboard Geral

Essa deve ser a tela principal e a mae do design system.

### KPIs

- saldo projetado D+30
- a pagar em aberto
- a receber em aberto
- inadimplencia
- OCR pendente
- conciliacao pendente
- SLA medio
- automacao

### Blocos obrigatorios

- calendario operacional
- 4 cards KPI principais
- 4 cards KPI secundarios
- grafico principal de fluxo de caixa
- carteira ativa
- card operacional
- despesas semanais
- alertas
- ultimas movimentacoes

### Acoes

- importar documentos
- novo lancamento
- conciliar
- cobrar
- exportar posicao

## Design system

- mesmo conjunto de cards, tabelas e graficos em todas as telas
- mudar apenas dados, labels e contexto
- bordas finas
- pills escuras
- cards discretos
- bastante respiro
- nada com cara de landing page
- nada com cara de ERP pesado

## Graficos

Use ApexCharts como padrao.
Os mesmos componentes de grafico devem aparecer nas diferentes telas, trocando apenas os dados:

- bar principal para fluxo
- donut para status
- barra horizontal para ranking
- linha/barra simples para volume

## Backend

Criar modulos:

- auth
- companies
- users
- documents
- financial-entries
- banking
- approvals
- dashboard
- audit

## Entidades

- Company
- User
- CompanyUser
- BankAccount
- Document
- DocumentExtraction
- FinancialEntry
- BankTransaction
- Reconciliation
- ApprovalRequest
- AuditLog

## Estados

Documento:
- UPLOADED
- NEEDS_REVIEW
- APPROVED
- REJECTED

Lancamento:
- DRAFT
- PENDING_APPROVAL
- APPROVED
- PAID
- RECEIVED

Conciliacao:
- IMPORTED
- SUGGESTED_MATCH
- RECONCILED

## Endpoints minimos

- POST /auth/login
- GET /auth/me
- GET /dashboard/summary
- GET /dashboard/cashflow
- GET /financial-entries
- POST /financial-entries
- PATCH /financial-entries/:id
- POST /financial-entries/:id/mark-paid
- POST /financial-entries/:id/mark-received
- POST /documents/upload
- GET /documents
- POST /documents/:id/process
- POST /documents/:id/review
- POST /bank-transactions/import
- GET /bank-transactions
- POST /reconciliations/suggest
- POST /reconciliations/confirm
- GET /approvals
- POST /approvals/:id/approve
- POST /approvals/:id/reject
- GET /audit-logs

## Regras de OCR/IA

- usar Hugging Face se configurado
- fallback manual obrigatorio
- o sistema nao pode travar se IA falhar

## Variaveis de ambiente

Backend `.env`:
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- STORAGE_PROVIDER
- STORAGE_BUCKET
- HF_API_KEY
- HF_MODEL_OCR
- HF_MODEL_CLASSIFICATION

Frontend `.env.local`:
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_API_URL

## Seed data

Criar dados suficientes para todas as telas:

- 2 ou 3 empresas
- 60 contas a pagar
- 40 contas a receber
- 30 documentos
- 20 conciliacoes concluidas
- 8 aprovacoes pendentes
- 10 itens em revisao

## Criterio final de qualidade

O resultado precisa parecer um software operacional dark de alta qualidade, muito proximo da referencia visual anexada, mas aplicado ao contexto de BPO financeiro para Simples Nacional.

Nao entregue uma landing page.
Nao entregue um ERP.
Entregue um painel interno premium, focado, escuro, enxuto e reutilizavel.
```

---

## Entrega esperada

Este documento deve ser a base unica para:

- planejamento do MVP
- alinhamento de design system
- implementacao frontend
- implementacao backend
- seeds
- verificacao final

