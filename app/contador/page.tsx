import { ContadorScreen } from "@/components/contador-screen";
import { apiErrorTracker, getAccountingExports } from "@/lib/api";

export default async function ContadorPage() {
  const exports = await getAccountingExports();
  const isDemo = apiErrorTracker().hasError || !exports;

  return <ContadorScreen exports={exports} isDemo={isDemo} />;
}