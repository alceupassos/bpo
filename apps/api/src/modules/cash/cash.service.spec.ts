import { Test } from "@nestjs/testing";
import { ResourceScopeService } from "../../common/resource-scope.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AiVisionService } from "../ai/ai-vision.service";
import { StorageService } from "../documents/storage.service";
import { CashService } from "./cash.service";

describe("CashService (saldo de caixa)", () => {
  let service: CashService;

  const prisma = {
    cashSession: { findFirst: jest.fn() }
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CashService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: {} },
        { provide: AiVisionService, useValue: {} },
        { provide: ResourceScopeService, useValue: {} }
      ]
    }).compile();

    service = module.get(CashService);
    jest.clearAllMocks();
  });

  it("calcula saldo: abertura + entradas - saidas", async () => {
    prisma.cashSession.findFirst.mockResolvedValue({
      id: "cash-1",
      companyId: "company-1",
      openingAmount: 200,
      status: "OPEN",
      entries: [
        { type: "SALE", amount: 150 },
        { type: "OUT", amount: 50 },
        { type: "SUPRIMENTO", amount: 30 }
      ]
    });

    const current = await service.current("company-1");
    expect(current?.balance).toBe(330);
  });
});