import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.auditLog.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  log(data: {
    companyId: string;
    entityType: string;
    entityId: string;
    action: string;
    actor: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
