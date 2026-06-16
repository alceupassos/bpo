import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { getDocuments } from "@/lib/api";
import { documentRows, pageSummaries } from "@/lib/data";
import { documentToRow } from "@/lib/formatters";

const summary = pageSummaries["/ocr-documentos"];

export default async function OcrDocumentosPage() {
  const docs = await getDocuments();
  const rows = docs ? docs.map(documentToRow) : documentRows;

  const metrics = docs
    ? [
        { label: "Recebidos", value: `${docs.length} docs` },
        { label: "Em revisao", value: `${docs.filter((d) => d.status === "NEEDS_REVIEW").length}` },
        {
          label: "Confianca media",
          value: `${
            docs.length
              ? Math.round(docs.reduce((s, d) => s + (d.confidence || 0), 0) / docs.length)
              : 0
          }%`
        }
      ]
    : summary.metrics;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />}>
      <ModuleOverview
        metrics={metrics}
        tableTitle="Fila documental"
        tableMeta="Uploads recentes, confianca do OCR e status de revisao"
        tableColumns={[
          { key: "documento", label: "Documento" },
          { key: "tipo", label: "Tipo" },
          { key: "fornecedor", label: "Fornecedor" },
          { key: "valor", label: "Valor" },
          { key: "confianca", label: "Confianca" },
          { key: "status", label: "Status" }
        ]}
        tableRows={rows}
        chartTitle="Pipeline OCR"
        chartMeta="Entrada, leitura, revisao e aprovacao"
        chartSeries={[{ name: "Documentos", data: [42, 37, 16, 28] }]}
        chartOptions={{
          colors: ["#9fe870"],
          xaxis: { categories: ["Upload", "Extraidos", "Em revisao", "Aprovados"] },
          legend: { show: false }
        }}
        sideTitle="Leitura do modulo"
        sideCopy="Aqui a IA acelera a entrada, mas o centro da tela continua sendo a fila de revisao para evitar atrito operacional."
      />
    </PageShell>
  );
}
