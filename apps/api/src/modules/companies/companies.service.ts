import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { CreateCompanyDto } from "./dto/create-company.dto";

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId?: string | null) {
    return this.prisma.company.findMany({
      where: companyId ? { id: companyId } : {},
      orderBy: { tradeName: "asc" }
    });
  }

  findOne(id: string) {
    return this.prisma.company.findUnique({ where: { id } });
  }

  async create(dto: CreateCompanyDto) {
    const existingCnpj = await this.prisma.company.findUnique({ where: { cnpj: dto.cnpj } });
    if (existingCnpj) {
      throw new ConflictException("CNPJ ja cadastrado");
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
    if (existingUser) {
      throw new ConflictException("E-mail do administrador ja cadastrado");
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          legalName: dto.legalName,
          tradeName: dto.tradeName,
          cnpj: dto.cnpj,
          taxRegime: dto.taxRegime,
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.adminName,
          email: dto.adminEmail,
          passwordHash,
          role: "GESTOR_EMPRESA",
          companyId: company.id,
        },
      });

      return {
        company,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      };
    });
  }
}
