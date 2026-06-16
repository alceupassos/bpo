import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

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
}
