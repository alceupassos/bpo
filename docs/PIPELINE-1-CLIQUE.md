# Fluxo 1 clique (ponta a ponta)

1. Acesse **Notas (OCR)** e envie a foto/PDF da nota.
2. Revise os dados extraidos pela IA (ou preencha manualmente).
3. Clique em **Processar tudo (1 clique)** na nota desejada.

O backend executa `POST /fiscal-notes/:id/process-full`:

- Cadastra/atualiza o **fornecedor**
- Da **entrada no estoque** dos produtos da nota
- Gera **titulo a pagar** no financeiro
- Registra **saida no caixa** (se houver sessao aberta)

Telas atualizadas automaticamente: notas, produtos, caixa, contas a pagar, fornecedores e conciliacao.