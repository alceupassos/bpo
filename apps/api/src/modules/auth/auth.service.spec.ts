import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { PrismaService } from "../../prisma/prisma.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  const prisma = {
    user: {
      findUnique: jest.fn()
    }
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue("test-secret") }
        }
      ]
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it("login com credenciais invalidas retorna 401", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login("nao@existe.com", "senhaerrada")).rejects.toThrow(
      UnauthorizedException
    );
  });
});