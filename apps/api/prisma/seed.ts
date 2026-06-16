import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ANCHOR = new Date("2026-06-16T12:00:00.000Z");

function makeRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rng = makeRng(20260616);
const pick = <T>(a: T[]): T => a[Math.floor(rng() * a.length)];
const between = (min: number, max: number) => Math.round(min + rng() * (max - min));
function dateOffset(days: number): Date {
  const d = new Date(ANCHOR.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

const companies = [
  { id: "company-1", legalName: "Comercial Praia Azul LTDA", tradeName: "Praia Azul", cnpj: "12.345.678/0001-90" },
  { id: "company-2", legalName: "Mercado Bom Preco LTDA", tradeName: "Bom Preco", cnpj: "98.765.432/0001-10" },
  { id: "company-3", legalName: "Rede Vida Farma LTDA", tradeName: "Vida Farma", cnpj: "45.678.912/0001-55" }
];
const companyIds = companies.map((c) => c.id);

const users = [
  { id: "user-1", name: "Alceu Passos", email: "operador@angra.local", passwordHash: "angra123", role: "OPERADOR_BPO" as const, companyId: null },
  { id: "user-2", name: "Diretoria Angra", email: "admin@angra.local", passwordHash: "angra123", role: "ADMIN_PLATAFORMA" as const, companyId: null },
  { id: "user-3", name: "Carla Mota", email: "gestor@praiaazul.com.br", passwordHash: "angra123", role: "GESTOR_EMPRESA" as const, companyId: "company-1" },
  { id: "user-4", name: "Diego Luz", email: "financeiro@bompreco.com.br", passwordHash: "angra123", role: "FINANCEIRO_EMPRESA" as const, companyId: "company-2" }
];

const bankAccounts = [
  { id: "acc-1", companyId: "company-1", bank: "Banco Inter", branch: "0001", number: "112233-4", balance: 84210 },
  { id: "acc-2", companyId: "company-1", bank: "Stone", branch: "0001", number: "556677-8", balance: 31980 },
  { id: "acc-3", companyId: "company-2", bank: "Banco do Brasil", branch: "1422", number: "99887-1", balance: 52640 },
  { id: "acc-4", companyId: "company-3", bank: "Caixa", branch: "0356", number: "44556-2", balance: 41020 }
];

const paySuppliers = ["Imobiliaria Horizonte", "Contabilidade Alfa", "Energia Sul", "OfficeNet Telecom", "Martins Distribuicao", "Transportes Vale", "Aguas do Litoral", "Seguros Litoral", "Limpeza Maxima", "Software Cloud BR"];
const payCategories = ["Aluguel", "Servicos de Terceiros", "Material de Consumo", "Marketing", "Utilidades e Energia", "Infraestrutura", "Impostos", "Folha"];
const recClients = ["Mercado Bom Preco LTDA", "Rede Vida Farma", "Construtora Atlantico", "Colegio Horizonte", "Clinica Santa Elena", "Auto Pecas Litoral", "Restaurante Maresia", "Padaria Trigo Dourado", "Hotel Costa Azul", "Loja Mar Aberto"];

type Entry = {
  id: string; companyId: string; type: "PAYABLE" | "RECEIVABLE"; status: string;
  description: string; counterpartyName: string; category: string; documentNumber: string;
  amount: number; issueDate: Date; dueDate: Date; paidDate: Date | null;
};

function buildEntries(): Entry[] {
  const entries: Entry[] = [];
  for (let i = 0; i < 60; i++) {
    const offset = between(-40, 45);
    const dueDate = dateOffset(offset);
    let status: string;
    const roll = rng();
    if (offset < -5) status = roll < 0.7 ? "PAID" : "APPROVED";
    else if (roll < 0.18) status = "PENDING_APPROVAL";
    else if (roll < 0.3) status = "DRAFT";
    else if (roll < 0.4) status = "PAID";
    else if (roll < 0.46) status = "CANCELLED";
    else status = "APPROVED";
    entries.push({
      id: `pay-${i + 1}`, companyId: pick(companyIds), type: "PAYABLE", status,
      description: `${pick(payCategories)} - ${dueDate.toISOString().slice(5, 10)}`,
      counterpartyName: pick(paySuppliers), category: pick(payCategories),
      documentNumber: `BOL-${between(1000, 9999)}`, amount: between(450, 14800),
      issueDate: dateOffset(offset - between(5, 25)), dueDate, paidDate: status === "PAID" ? dueDate : null
    });
  }
  for (let i = 0; i < 40; i++) {
    const offset = between(-40, 45);
    const dueDate = dateOffset(offset);
    let status: string;
    const roll = rng();
    if (offset < -5) status = roll < 0.65 ? "RECEIVED" : "APPROVED";
    else if (roll < 0.2) status = "PENDING_APPROVAL";
    else if (roll < 0.35) status = "RECEIVED";
    else if (roll < 0.4) status = "CANCELLED";
    else status = "APPROVED";
    entries.push({
      id: `rec-${i + 1}`, companyId: pick(companyIds), type: "RECEIVABLE", status,
      description: `NF-e ${between(4000, 4999)}`, counterpartyName: pick(recClients), category: "Vendas",
      documentNumber: `NFE-${between(4000, 4999)}`, amount: between(800, 18900),
      issueDate: dateOffset(offset - between(5, 20)), dueDate, paidDate: status === "RECEIVED" ? dueDate : null
    });
  }
  return entries;
}

async function main() {
  // Limpa (ordem segura; relações com cascade limpam filhos)
  await prisma.chatMessage.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.cashEntry.deleteMany();
  await prisma.cashSession.deleteMany();
  await prisma.noteItem.deleteMany();
  await prisma.fiscalNote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.bankTransaction.deleteMany();
  await prisma.document.deleteMany();
  await prisma.financialEntry.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  await prisma.company.createMany({ data: companies });
  await prisma.user.createMany({ data: users });
  await prisma.bankAccount.createMany({ data: bankAccounts });

  const entries = buildEntries();
  await prisma.financialEntry.createMany({ data: entries as never });

  // Documentos (30; 10 em revisão)
  const docTypes = ["Boleto", "Nota Fiscal", "Recibo", "Fatura", "Contrato"];
  const docs = Array.from({ length: 30 }, (_, i) => {
    let status: string;
    if (i < 10) status = "NEEDS_REVIEW";
    else { const r = rng(); status = r < 0.7 ? "APPROVED" : r < 0.85 ? "UPLOADED" : "REJECTED"; }
    return {
      id: `doc-${i + 1}`, companyId: pick(companyIds), type: pick(docTypes), status,
      supplier: pick(paySuppliers), amount: between(320, 9800), category: pick(payCategories),
      confidence: status === "NEEDS_REVIEW" ? between(55, 78) : between(82, 99),
      source: status === "NEEDS_REVIEW" ? "MANUAL" : "AI", uploadedAt: dateOffset(-between(0, 12))
    };
  });
  await prisma.document.createMany({ data: docs as never });

  // Transações bancárias (26; 20 conciliadas)
  const txDesc = ["PIX Recebido", "Pagamento fornecedor", "TED Recebida", "Tarifa bancaria", "Liquidacao boleto", "Antecipacao cartao", "Suprimento caixa"];
  const txs = Array.from({ length: 26 }, (_, i) => {
    let status: string;
    const r = rng();
    if (i < 20) status = "RECONCILED";
    else if (r < 0.5) status = "SUGGESTED_MATCH";
    else if (r < 0.8) status = "IMPORTED";
    else status = "DIVERGENT";
    const acc = pick(bankAccounts);
    const incoming = rng() < 0.55;
    return {
      id: `tx-${i + 1}`, companyId: acc.companyId, bankAccountId: acc.id, date: dateOffset(-between(0, 20)),
      description: pick(txDesc), amount: between(500, 12000) * (incoming ? 1 : -1), status,
      matchedEntryId: status === "RECONCILED" || status === "SUGGESTED_MATCH" ? pick(entries).id : null,
      divergence: status === "DIVERGENT" ? between(10, 350) : 0
    };
  });
  await prisma.bankTransaction.createMany({ data: txs as never });

  // Aprovações (8 a partir de lançamentos pendentes)
  const pending = entries.filter((e) => e.status === "PENDING_APPROVAL").slice(0, 8);
  await prisma.approvalRequest.createMany({
    data: pending.map((e, i) => ({
      id: `approval-${i + 1}`, companyId: e.companyId, targetType: e.type, targetId: e.id,
      description: `${e.counterpartyName} - ${e.description}`, amount: e.amount,
      requestedBy: "operador@angra.local", status: "PENDING", createdAt: dateOffset(-between(0, 5))
    })) as never
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: entries.slice(0, 12).map((e, i) => ({
      id: `audit-${i + 1}`, companyId: e.companyId, entityType: "FINANCIAL_ENTRY", entityId: e.id,
      action: e.status === "PAID" ? "ENTRY_PAID" : e.status === "PENDING_APPROVAL" ? "APPROVAL_REQUESTED" : "ENTRY_UPDATED",
      actor: "operador@angra.local", createdAt: dateOffset(-i)
    })) as never
  });

  // Produtos (catálogo demo)
  const prods = [
    { name: "Pao Frances (kg)", unit: "KG", price: 16.9, category: "Padaria" },
    { name: "Leite Integral 1L", unit: "UN", price: 5.49, category: "Mercearia" },
    { name: "Cafe Torrado 500g", unit: "UN", price: 18.9, category: "Mercearia" },
    { name: "Gasolina Comum (L)", unit: "L", price: 6.19, category: "Combustivel" },
    { name: "Diesel S10 (L)", unit: "L", price: 6.39, category: "Combustivel" },
    { name: "Refrigerante 2L", unit: "UN", price: 9.9, category: "Bebidas" },
    { name: "Agua Mineral 500ml", unit: "UN", price: 2.5, category: "Bebidas" },
    { name: "Sonho Recheado", unit: "UN", price: 7.5, category: "Padaria" }
  ];
  await prisma.product.createMany({
    data: prods.map((p, i) => ({ id: `prod-${i + 1}`, companyId: "company-1", barcode: `789${between(1000000, 9999999)}`, ...p })) as never
  });

  // Nota fiscal exemplo (em revisão) com itens
  await prisma.fiscalNote.create({
    data: {
      id: "note-1", companyId: "company-1", type: "CUPOM", supplierName: "Padaria Trigo Dourado",
      supplierCnpj: "11.222.333/0001-44", total: 47.8, issueDate: dateOffset(-1), status: "NEEDS_REVIEW",
      source: "AI",
      items: {
        create: [
          { description: "Pao Frances (kg)", qty: 1.2, unitPrice: 16.9, total: 20.28 },
          { description: "Leite Integral 1L", qty: 3, unitPrice: 5.49, total: 16.47 },
          { description: "Cafe Torrado 500g", qty: 1, unitPrice: 18.9, total: 18.9 }
        ]
      }
    }
  });

  // Caixa aberto com movimentos
  await prisma.cashSession.create({
    data: {
      id: "cash-1", companyId: "company-1", openedBy: "operador@angra.local", openingAmount: 200,
      status: "OPEN", openedAt: dateOffset(0),
      entries: {
        create: [
          { type: "SALE", amount: 47.8, description: "Venda balcao", paymentMethod: "PIX" },
          { type: "SALE", amount: 23.4, description: "Venda balcao", paymentMethod: "Dinheiro" },
          { type: "OUT", amount: 30, description: "Troco / sangria", paymentMethod: "Dinheiro" },
          { type: "SUPRIMENTO", amount: 100, description: "Suprimento inicial", paymentMethod: "Dinheiro" }
        ]
      }
    }
  });

  // Conversa WhatsApp demo
  await prisma.chatThread.create({
    data: {
      id: "thread-1", companyId: "company-1", contactName: "Padaria Trigo Dourado", contactPhone: "+55 11 90000-0001",
      messages: {
        create: [
          { direction: "IN", body: "Bom dia! Segue a nota da compra de hoje." },
          { direction: "OUT", body: "Recebido! Vou lancar no sistema." },
          { direction: "IN", body: "Obrigado!" }
        ]
      }
    }
  });

  console.log("Seed concluido.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
