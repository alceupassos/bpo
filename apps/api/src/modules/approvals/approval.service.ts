import { approvals, scopeByCompany, type ApprovalRequest } from "../../data/seed";

export class ApprovalService {
  private readonly items: ApprovalRequest[] = [...approvals];

  list(companyId?: string | null) {
    return scopeByCompany(this.items, companyId);
  }

  approve(id: string) {
    const item = this.items.find((a) => a.id === id);
    if (item) item.status = "APPROVED";
    return item ?? { id, status: "APPROVED" };
  }

  reject(id: string) {
    const item = this.items.find((a) => a.id === id);
    if (item) item.status = "REJECTED";
    return item ?? { id, status: "REJECTED" };
  }
}
