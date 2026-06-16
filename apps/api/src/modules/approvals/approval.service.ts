import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.approvalRequest.findMany({
      where: { ...(companyId ? { companyId } : {}), status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });
  }

  approve(id: string) {
    return this.prisma.approvalRequest.update({ where: { id }, data: { status: "APPROVED" } });
  }

  reject(id: string) {
    return this.prisma.approvalRequest.update({ where: { id }, data: { status: "REJECTED" } });
  }
}
