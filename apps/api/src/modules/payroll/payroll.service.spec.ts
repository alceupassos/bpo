import { Test } from "@nestjs/testing";
import { PrismaService } from "../../prisma/prisma.service";
import { PayrollService } from "./payroll.service";

describe("PayrollService (calculo de folha)", () => {
  let service: PayrollService;

  const prisma = {
    employee: { findMany: jest.fn() },
    payrollEntry: { findFirst: jest.fn(), create: jest.fn() }
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PayrollService, { provide: PrismaService, useValue: prisma }]
    }).compile();

    service = module.get(PayrollService);
    jest.clearAllMocks();
  });

  it("gera folha com FGTS 8%, INSS 9% e liquido correto", async () => {
    prisma.employee.findMany.mockResolvedValue([
      { id: "emp-1", companyId: "company-1", salary: 2000, status: "ATIVO" }
    ]);
    prisma.payrollEntry.findFirst.mockResolvedValue(null);
    prisma.payrollEntry.create.mockImplementation(({ data }) => Promise.resolve(data));

    const result = await service.generate("2026-06", "company-1");

    expect(result).toEqual({ competence: "2026-06", created: 1 });
    expect(prisma.payrollEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          baseSalary: 2000,
          fgts: 160,
          inss: 180,
          netPay: 1820,
          vacationDue: 166.67
        })
      })
    );
  });
});