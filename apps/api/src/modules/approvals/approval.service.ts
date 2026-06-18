import { Injectable } from "@nestjs/common";
import { ResourceScopeService } from "../../common/resource-scope.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ResourceScopeService
  ) {}

  list(companyId?: string | null) {
    return this.prisma.approvalRequest.findMany({
      where: { ...(companyId ? { companyId } : {}), status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });
  }

  async approve(id: string, companyId?: string | null) {
    await this.scope.approval(id, companyId);
    return this.prisma.approvalRequest.update({ where: { id }, data: { status: "APPROVED" } });
  }

  async reject(id: string, companyId?: string | null) {
    await this.scope.approval(id, companyId);
    return this.prisma.approvalRequest.update({ where: { id }, data: { status: "REJECTED" } });
  }
}
