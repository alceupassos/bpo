import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(companyId?: string | null) {
    return this.prisma.user.findMany({
      where: companyId ? { companyId } : {},
      select: { id: true, name: true, email: true, role: true, companyId: true, createdAt: true },
      orderBy: { name: "asc" }
    });
  }
}
