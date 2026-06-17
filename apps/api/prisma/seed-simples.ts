/**
 * Seed ADITIVO e idempotente para os módulos novos (fornecedores, clientes,
 * obrigações fiscais, folha, societário, contador) + estoque de produtos.
 *
 * Diferente de `seed.ts`, este script NÃO apaga nada — só faz INSERT com
 * skipDuplicates e atualiza colunas novas. Seguro de rodar em produção sobre
 * uma base já existente. IDs fixos garantem idempotência.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ANCHOR = new Date("2026-06-16T12:00:00.000Z");
function dateOffset(days: number): Date {
  const d = new Date(ANCHOR.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const company = (await prisma.company.findFirst()) ?? { id: "company-1" };
  const companyId = company.id;

  await prisma.supplier.createMany({
    skipDuplicates: true,
    data: [
      { id: "sup-1", companyId, name: "Martins Distribuicao", cnpj: "11.222.333/0001-44", category: "Mercearia" },
      { id: "sup-2", companyId, name: "Posto Litoral", cnpj: "22.333.444/0001-55", category: "Combustivel" },
      { id: "sup-3", companyId, name: "Padaria Trigo Dourado", cnpj: "33.444.555/0001-66", category: "Padaria" },
      { id: "sup-4", companyId, name: "Bebidas Litoral", cnpj: "44.555.666/0001-77", category: "Bebidas" }
    ] as never
  });

  await prisma.customer.createMany({
    skipDuplicates: true,
    data: [
      { id: "cus-1", companyId, name: "Joao da Silva", document: "111.222.333-44", phone: "+55 11 98888-0001", qrToken: "QR-JOAO-001", creditLimit: 500, balance: 120 },
      { id: "cus-2", companyId, name: "Maria Souza", document: "222.333.444-55", phone: "+55 11 98888-0002", qrToken: "QR-MARIA-002", creditLimit: 800, balance: 0 },
      { id: "cus-3", companyId, name: "Pedro Lima", document: "333.444.555-66", phone: "+55 11 98888-0003", qrToken: "QR-PEDRO-003", creditLimit: 300, balance: 47.8 }
    ] as never
  });

  const dasMonths = [
    { comp: "2026-03", off: -90, status: "PAGO", amount: 4100 },
    { comp: "2026-04", off: -60, status: "PAGO", amount: 4250 },
    { comp: "2026-05", off: -30, status: "PAGO", amount: 4380 },
    { comp: "2026-06", off: 4, status: "PENDENTE", amount: 4520 }
  ];
  await prisma.taxObligation.createMany({
    skipDuplicates: true,
    data: [
      ...dasMonths.map((m, i) => ({
        id: `das-${i + 1}`, companyId, type: "DAS", competence: m.comp,
        dueDate: dateOffset(m.off), amount: m.amount, baseRevenue: 150000,
        status: m.status, paidDate: m.status === "PAGO" ? dateOffset(m.off) : null
      })),
      { id: "defis-1", companyId, type: "DEFIS", competence: "2025", dueDate: dateOffset(-10), amount: 0, baseRevenue: 1842300, status: "PAGO", paidDate: dateOffset(-12) }
    ] as never
  });

  const employees = [
    { id: "emp-1", companyId, name: "Ana Paula", cpf: "123.456.789-00", role: "Atendente", salary: 1850, admissionDate: dateOffset(-400) },
    { id: "emp-2", companyId, name: "Bruno Carvalho", cpf: "234.567.890-11", role: "Caixa", salary: 1700, admissionDate: dateOffset(-220) },
    { id: "emp-3", companyId, name: "Carla Dias", cpf: "345.678.901-22", role: "Padeira", salary: 2200, admissionDate: dateOffset(-600) }
  ];
  await prisma.employee.createMany({ skipDuplicates: true, data: employees as never });
  await prisma.payrollEntry.createMany({
    skipDuplicates: true,
    data: employees.map((e, i) => ({
      id: `pay-run-${i + 1}`, companyId, employeeId: e.id, competence: "2026-05",
      baseSalary: e.salary, fgts: Math.round(e.salary * 0.08 * 100) / 100, inss: Math.round(e.salary * 0.09 * 100) / 100,
      netPay: Math.round(e.salary * 0.91 * 100) / 100, vacationDue: Math.round((e.salary / 12) * 100) / 100,
      esocialStatus: "ENVIADO", status: "PAGA"
    })) as never
  });

  await prisma.corporateDoc.createMany({
    skipDuplicates: true,
    data: [
      { id: "doc-soc-1", companyId, type: "CONTRATO_SOCIAL", title: "Contrato Social - 3a alteracao", issueDate: dateOffset(-700) },
      { id: "doc-soc-2", companyId, type: "CERTIFICADO_DIGITAL", title: "Certificado e-CNPJ A1", issueDate: dateOffset(-300), expiryDate: dateOffset(40) },
      { id: "doc-soc-3", companyId, type: "PROCURACAO", title: "Procuracao contador", issueDate: dateOffset(-200), expiryDate: dateOffset(160) }
    ] as never
  });

  await prisma.accountingExport.createMany({
    skipDuplicates: true,
    data: [
      { id: "exp-1", companyId, competence: "2026-05", format: "ZIP", status: "GERADO", notesCount: 1, entriesCount: 34, payrollCount: 3, storagePath: `storage/exports/${companyId}-2026-05.zip`, generatedAt: dateOffset(-2) }
    ] as never
  });

  // Estoque demo: define quantidade para produtos ainda sem saldo.
  const products = await prisma.product.findMany({ where: { stockQty: 0 } });
  let i = 0;
  for (const p of products) {
    i += 1;
    const qty = 10 + ((i * 17) % 110);
    await prisma.product.update({
      where: { id: p.id },
      data: { stockQty: qty, minStock: 10, cost: Math.round(p.price * 0.7 * 100) / 100 }
    });
  }

  console.log(`Seed aditivo concluido. Produtos com estoque ajustado: ${products.length}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
