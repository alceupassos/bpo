import { auditLogs, scopeByCompany } from "../../data/seed";

export class AuditService {
  list(companyId?: string | null) {
    return scopeByCompany(auditLogs, companyId);
  }
}
