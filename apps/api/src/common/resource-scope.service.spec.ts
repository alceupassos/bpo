import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { ResourceScopeService } from "./resource-scope.service";

describe("ResourceScopeService (isolamento multi-tenant)", () => {
  let service: ResourceScopeService;

  const prisma = {
    financialEntry: { findUnique: jest.fn() }
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ResourceScopeService,
        { provide: PrismaService, useValue: prisma }
      ]
    }).compile();

    service = module.get(ResourceScopeService);
    jest.clearAllMocks();
  });

  it("bloqueia acesso a recurso de outra empresa", async () => {
    prisma.financialEntry.findUnique.mockResolvedValue({
      id: "pay-1",
      companyId: "company-2"
    });

    await expect(service.financialEntry("pay-1", "company-1")).rejects.toThrow(NotFoundException);
  });

  it("permite acesso quando companyId coincide", async () => {
    const row = { id: "pay-1", companyId: "company-1" };
    prisma.financialEntry.findUnique.mockResolvedValue(row);

    await expect(service.financialEntry("pay-1", "company-1")).resolves.toEqual(row);
  });

  it("operador BPO (companyId null) acessa qualquer tenant", async () => {
    const row = { id: "pay-1", companyId: "company-2" };
    prisma.financialEntry.findUnique.mockResolvedValue(row);

    await expect(service.financialEntry("pay-1", null)).resolves.toEqual(row);
  });
});