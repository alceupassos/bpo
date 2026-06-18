import { FiscalTrabalhistaScreen } from "@/components/fiscal-trabalhista-screen";
import {
  apiErrorTracker,
  getEmployees,
  getFaturamento12m,
  getPayrollRuns,
  getTaxObligations
} from "@/lib/api";

export default async function FiscalTrabalhistaPage() {
  const [obligations, runs, employees, faturamento] = await Promise.all([
    getTaxObligations(),
    getPayrollRuns(),
    getEmployees(),
    getFaturamento12m()
  ]);

  const isDemo = apiErrorTracker().hasError || !obligations;

  return (
    <FiscalTrabalhistaScreen
      obligations={obligations}
      runs={runs}
      employees={employees}
      faturamento={faturamento}
      isDemo={isDemo}
    />
  );
}