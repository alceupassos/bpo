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
    data: prods.map((p, i) => ({
      id: `prod-${i + 1}`,
      companyId: "company-1",
      barcode: `789${between(1000000, 9999999)}`,
      stockQty: between(0, 120),
      minStock: 10,
      cost: Math.round(p.price * 0.7 * 100) / 100,
      ...p
    })) as never
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

  // Fornecedores cadastrados (company-1)
  await prisma.supplier.createMany({
    data: [
      { id: "sup-1", companyId: "company-1", name: "Martins Distribuicao", cnpj: "11.222.333/0001-44", category: "Mercearia" },
      { id: "sup-2", companyId: "company-1", name: "Posto Litoral", cnpj: "22.333.444/0001-55", category: "Combustivel" },
      { id: "sup-3", companyId: "company-1", name: "Padaria Trigo Dourado", cnpj: "33.444.555/0001-66", category: "Padaria" },
      { id: "sup-4", companyId: "company-1", name: "Bebidas Litoral", cnpj: "44.555.666/0001-77", category: "Bebidas" }
    ] as never
  });

  // Clientes do crediario, identificaveis por QR no caixa
  await prisma.customer.createMany({
    data: [
      { id: "cus-1", companyId: "company-1", name: "Joao da Silva", document: "111.222.333-44", phone: "+55 11 98888-0001", qrToken: "QR-JOAO-001", creditLimit: 500, balance: 120 },
      { id: "cus-2", companyId: "company-1", name: "Maria Souza", document: "222.333.444-55", phone: "+55 11 98888-0002", qrToken: "QR-MARIA-002", creditLimit: 800, balance: 0 },
      { id: "cus-3", companyId: "company-1", name: "Pedro Lima", document: "333.444.555-66", phone: "+55 11 98888-0003", qrToken: "QR-PEDRO-003", creditLimit: 300, balance: 47.8 }
    ] as never
  });

  // Obrigacoes fiscais: DAS dos ultimos meses + DEFIS anual
  const dasMonths = [
    { comp: "2026-03", off: -90, status: "PAGO" },
    { comp: "2026-04", off: -60, status: "PAGO" },
    { comp: "2026-05", off: -30, status: "PAGO" },
    { comp: "2026-06", off: 4, status: "PENDENTE" }
  ];
  await prisma.taxObligation.createMany({
    data: [
      ...dasMonths.map((m, i) => ({
        id: `das-${i + 1}`, companyId: "company-1", type: "DAS", competence: m.comp,
        dueDate: dateOffset(m.off), amount: between(3800, 4600), baseRevenue: between(120000, 180000),
        status: m.status, paidDate: m.status === "PAGO" ? dateOffset(m.off) : null
      })),
      { id: "defis-1", companyId: "company-1", type: "DEFIS", competence: "2025", dueDate: dateOffset(-10), amount: 0, baseRevenue: 1842300, status: "PAGO", paidDate: dateOffset(-12) }
    ] as never
  });

  // Funcionarios + folha da competencia 2026-05
  const employees = [
    { id: "emp-1", companyId: "company-1", name: "Ana Paula", cpf: "123.456.789-00", role: "Atendente", salary: 1850, admissionDate: dateOffset(-400) },
    { id: "emp-2", companyId: "company-1", name: "Bruno Carvalho", cpf: "234.567.890-11", role: "Caixa", salary: 1700, admissionDate: dateOffset(-220) },
    { id: "emp-3", companyId: "company-1", name: "Carla Dias", cpf: "345.678.901-22", role: "Padeira", salary: 2200, admissionDate: dateOffset(-600) }
  ];
  await prisma.employee.createMany({ data: employees as never });
  await prisma.payrollEntry.createMany({
    data: employees.map((e, i) => ({
      id: `pay-run-${i + 1}`, companyId: "company-1", employeeId: e.id, competence: "2026-05",
      baseSalary: e.salary, fgts: Math.round(e.salary * 0.08 * 100) / 100, inss: Math.round(e.salary * 0.09 * 100) / 100,
      netPay: Math.round(e.salary * 0.91 * 100) / 100, vacationDue: Math.round((e.salary / 12) * 100) / 100,
      esocialStatus: "ENVIADO", status: "PAGA"
    })) as never
  });

  // Documentos societarios
  await prisma.corporateDoc.createMany({
    data: [
      { id: "doc-soc-1", companyId: "company-1", type: "CONTRATO_SOCIAL", title: "Contrato Social - 3a alteracao", issueDate: dateOffset(-700) },
      { id: "doc-soc-2", companyId: "company-1", type: "CERTIFICADO_DIGITAL", title: "Certificado e-CNPJ A1", issueDate: dateOffset(-300), expiryDate: dateOffset(40) },
      { id: "doc-soc-3", companyId: "company-1", type: "PROCURACAO", title: "Procuracao contador", issueDate: dateOffset(-200), expiryDate: dateOffset(160) }
    ] as never
  });

  // Pacote de exportacao para o contador
  await prisma.accountingExport.createMany({
    data: [
      { id: "exp-1", companyId: "company-1", competence: "2026-05", format: "ZIP", status: "GERADO", notesCount: 1, entriesCount: 34, payrollCount: 3, storagePath: "storage/exports/company-1-2026-05.zip", generatedAt: dateOffset(-2) }
    ] as never
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
