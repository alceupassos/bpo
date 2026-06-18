import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type EmployeePayload = {
  name: string;
  cpf?: string;
  role?: string;
  salary?: number;
  admissionDate?: string;
};

// Encargos simplificados para demonstração (não substituem cálculo oficial).
const FGTS_RATE = 0.08;
const INSS_RATE = 0.09;

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  listEmployees(companyId?: string | null) {
    return this.prisma.employee.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { name: "asc" }
    });
  }

  createEmployee(payload: EmployeePayload, companyId?: string | null) {
    return this.prisma.employee.create({
      data: {
        companyId: companyId ?? "company-1",
        name: payload.name,
        cpf: payload.cpf,
        role: payload.role,
        salary: payload.salary ?? 0,
        admissionDate: payload.admissionDate ? new Date(payload.admissionDate) : null
      }
    });
  }

  listRuns(companyId?: string | null) {
    return this.prisma.payrollEntry.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
      include: { employee: true },
      take: 100
    });
  }

  /** Gera a folha de uma competência ("AAAA-MM") para os funcionários ativos. */
  async generate(competence: string, companyId?: string | null) {
    const employees = await this.prisma.employee.findMany({
      where: { ...(companyId ? { companyId } : {}), status: "ATIVO" }
    });
    let created = 0;
    for (const emp of employees) {
      const exists = await this.prisma.payrollEntry.findFirst({
        where: { employeeId: emp.id, competence }
      });
      if (exists) continue;
      const fgts = Math.round(Number(emp.salary) * FGTS_RATE * 100) / 100;
      const inss = Math.round(Number(emp.salary) * INSS_RATE * 100) / 100;
      await this.prisma.payrollEntry.create({
        data: {
          companyId: emp.companyId,
          employeeId: emp.id,
          competence,
          baseSalary: emp.salary,
          fgts,
          inss,
          netPay: Math.round((Number(emp.salary) - inss) * 100) / 100,
          vacationDue: Math.round((Number(emp.salary) / 12) * 100) / 100
        }
      });
      created += 1;
    }
    return { competence, created };
  }

  pay(id: string) {
    return this.prisma.payrollEntry.update({
      where: { id },
      data: { status: "PAGA", esocialStatus: "ENVIADO" }
    });
  }

  async summary(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const [ativos, runs] = await Promise.all([
      this.prisma.employee.count({ where: { ...where, status: "ATIVO" } }),
      this.prisma.payrollEntry.findMany({ where })
    ]);
    const custoFolha = runs.reduce((s, r) => s + Number(r.baseSalary) + Number(r.fgts), 0);
    const fgtsTotal = runs.reduce((s, r) => s + Number(r.fgts), 0);
    return {
      funcionariosAtivos: ativos,
      custoFolha: Math.round(custoFolha),
      fgtsTotal: Math.round(fgtsTotal),
      competencias: new Set(runs.map((r) => r.competence)).size
    };
  }
}
