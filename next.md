# Plano Next - Links, Rotas e Continuidade do BPO SaaS

## Objetivo

Garantir que todas as areas clicaveis do MVP levem para uma tela real, mantendo o produto como uma aplicacao interna de BPO financeiro para empresas do Simples Nacional: simples, operacional, dark, com dashboard como centro de comando e sem expandir para um ERP.

## Estado atual

- Preview web ativo em `http://127.0.0.1:4501`.
- API ativa em `http://127.0.0.1:4502/api`.
- Dashboard Geral implementado como tela principal.
- Rotas internas implementadas para:
  - `/`
  - `/contas-a-pagar`
  - `/contas-a-receber`
  - `/conciliacao`
  - `/ocr-documentos`
  - `/relatorios`
  - `/painel-cliente`
  - `/configuracoes`
- Navegacao superior, lateral e acoes rapidas devem apontar sempre para essas rotas reais.

## Mapa de links

| Origem | Destino | Intencao |
| --- | --- | --- |
| Dashboard Geral | `/` | Command center da operacao |
| Contas a Pagar | `/contas-a-pagar` | Agenda de pagamentos, aprovacao e baixa |
| Contas a Receber | `/contas-a-receber` | Carteira, aging, cobranca e recebimentos |
| Conciliacao | `/conciliacao` | Pendencias de extrato, caixa e cartao |
| OCR e Documentos | `/ocr-documentos` | Upload, OCR, revisao e classificacao simples |
| Relatorios | `/relatorios` | Fluxo de caixa, categorias e exportacao simples |
| Painel do Cliente | `/painel-cliente` | Pendencias, aprovacoes e historico do cliente |
| Configuracoes | `/configuracoes` | Empresa, usuarios, bancos e regras minimas |

## Ajustes executados neste ciclo

- Remover cortes de navegacao no topo para que todos os modulos aparecam.
- Transformar acoes rapidas do dashboard em links reais.
- Transformar icones secundarios da lateral em links para modulos existentes.
- Transformar botao de configuracoes do topo em link para `/configuracoes`.
- Transformar alerta/notificacao do topo em link para `/ocr-documentos`.
- Transformar botoes de detalhe dos cards em link para `/relatorios`.
- Transformar atalho de carteira ativa em link para `/contas-a-receber`.

## Proximo ciclo recomendado

1. Conectar frontend aos endpoints da API

- `GET /api/dashboard/summary`
- `GET /api/dashboard/cashflow`
- `GET /api/financial-entries`
- `GET /api/documents`
- `GET /api/bank-transactions`
- `GET /api/approvals`
- `GET /api/audit-logs`

2. Criar camada de dados do frontend

- `lib/api.ts` para chamadas HTTP.
- `lib/formatters.ts` para moeda, data e status.
- Estados de loading, erro e vazio por modulo.
- Fallback para dados seed quando a API estiver indisponivel.

3. Completar fluxos principais

- Dashboard abre pendencia e leva ao modulo correto.
- Pagar permite criar lancamento, aprovar e baixar.
- Receber permite registrar baixa e acompanhar atraso.
- OCR permite revisar documento e gerar lancamento.
- Conciliacao permite confirmar sugestao de match.
- Relatorios exportam leitura simples.
- Painel do Cliente mostra apenas dados e aprovacoes do cliente.

4. Preparar persistencia real

- Adicionar PostgreSQL.
- Criar schema minimo: empresas, usuarios, contas bancarias, documentos, extracoes, lancamentos, transacoes, conciliacoes, aprovacoes e logs.
- Criar seeds coerentes com os dashboards.
- Manter OCR e classificacao por IA como plugavel via Hugging Face, com fallback manual.

5. Validacao obrigatoria

- Abrir cada rota pelo topo.
- Abrir cada rota pela lateral.
- Abrir cada acao rapida.
- Conferir resposta `200` em todas as paginas.
- Confirmar que o layout nao quebra em desktop e mobile.
- Confirmar que ausencia de IA externa nao bloqueia upload, revisao ou lancamento manual.

## Criterio de pronto

O ciclo de links e navegacao esta pronto quando qualquer area visualmente clicavel leva a uma rota existente, nenhum link retorna `404`, o preview acima de `4500` continua ativo e o dashboard permanece como ponto de partida do produto.
