import { ArrowDownToLine, BellRing, CircleDollarSign, FileSearch, Landmark, ShieldAlert, TimerReset, Wallet } from "lucide-react";
import type { Kpi, NavItem, QuickAction, TableRow } from "@/lib/types";

export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/contas-a-pagar", label: "A Pagar", icon: "wallet" },
  { href: "/contas-a-receber", label: "A Receber", icon: "badge-dollar-sign" },
  { href: "/notas", label: "Notas (OCR)", icon: "receipt-text" },
  { href: "/produtos", label: "Produtos", icon: "package" },
  { href: "/caixa", label: "Caixa", icon: "calculator" },
  { href: "/clientes", label: "Clientes", icon: "users-round" },
  { href: "/conciliacao", label: "Conciliacao", icon: "scale" },
  { href: "/inteligencia", label: "IA Financeira", icon: "sparkles" },
  { href: "/fiscal-trabalhista", label: "Fiscal/Trab", icon: "percent" },
  { href: "/contador", label: "Contador", icon: "briefcase" },
  { href: "/whatsapp", label: "WhatsApp", icon: "message-circle" },
  { href: "/relatorios", label: "Relatorios", icon: "chart-column-big" },
  { href: "/painel-cliente", label: "Painel Cliente", icon: "monitor-dot" },
  { href: "/configuracoes", label: "Config", icon: "settings-2" }
];

export const dashboardKpis: Kpi[] = [
  {
    label: "Saldo projetado D+30",
    value: "R$ 146.980",
    delta: "+8,37%",
    trend: "up",
    sparkline: [82, 88, 80, 78, 71, 76, 84, 86, 83, 91]
  },
  {
    label: "A pagar em aberto",
    value: "R$ 96.320",
    delta: "-5,12%",
    trend: "down",
    sparkline: [70, 64, 66, 73, 67, 71, 69, 74, 82, 90]
  },
  {
    label: "A receber em aberto",
    value: "R$ 141.870",
    delta: "+12,48%",
    trend: "up",
    sparkline: [74, 79, 71, 82, 78, 86, 77, 74, 68, 72]
  },
  {
    label: "Inadimplencia (+90 dias)",
    value: "R$ 31.642",
    delta: "+3,21%",
    trend: "down",
    sparkline: [58, 55, 49, 44, 39, 41, 38, 42, 40, 43]
  },
  {
    label: "OCR pendente",
    value: "27",
    delta: "-15,63%",
    trend: "up",
    sparkline: [42, 40, 38, 37, 35, 34, 30, 29, 28, 27]
  },
  {
    label: "Conciliacao pendente",
    value: "42",
    delta: "-18,75%",
    trend: "up",
    sparkline: [68, 63, 60, 58, 52, 49, 48, 46, 44, 42]
  },
  {
    label: "SLA medio (dias)",
    value: "1,8",
    delta: "-0,3 dia",
    trend: "up",
    sparkline: [3.2, 3.1, 2.9, 2.7, 2.5, 2.3, 2.2, 2.0, 1.9, 1.8]
  },
  {
    label: "Automacao (%)",
    value: "63%",
    delta: "+6 p.p.",
    trend: "up",
    sparkline: [34, 40, 43, 47, 50, 54, 56, 58, 60, 63]
  }
];

export const cashflowSeries = {
  categories: ["24/05", "27/05", "30/05", "02/06", "05/06", "08/06", "11/06", "14/06", "17/06", "20/06", "23/06"],
  projected: [54000, 86000, 112000, 78000, 24000, -52000, 18000, 94000, 148000, 209000, 233000],
  realized: [21000, 41000, 47000, 45000, 28000, -18000, 14000, 39000, 61000, 78000, 96500]
};

export const payablesStatus = [
  { label: "A vencer", value: 78152, color: "#214d99" },
  { label: "Vencido", value: 52173, color: "#c53d4f" },
  { label: "Pago", value: 33417, color: "#32796f" },
  { label: "Parcial", value: 14873, color: "#db9c3b" },
  { label: "Cancelado", value: 7708, color: "#cfd6e2" }
];

export const receivablesStatus = [
  { label: "A vencer", value: 153684, color: "#214d99" },
  { label: "Vencido", value: 60338, color: "#c53d4f" },
  { label: "Recebido", value: 33075, color: "#32796f" },
  { label: "Parcial", value: 22045, color: "#db9c3b" },
  { label: "Cancelado", value: 5746, color: "#cfd6e2" }
];

export const topExpenseCategories = [
  { label: "Servicos de Terceiros", value: 48752.4 },
  { label: "Aluguel", value: 32780.0 },
  { label: "Material de Consumo", value: 21948.9 },
  { label: "Marketing", value: 15643.2 },
  { label: "Utilidades e Energia", value: 9215.6 }
];

export const volumeProcessed = {
  categories: ["18/05", "19/05", "20/05", "21/05", "22/05", "23/05", "24/05"],
  documents: [58, 72, 64, 96, 84, 76, 41],
  launches: [46, 55, 51, 71, 62, 49, 28]
};

export const quickActions: QuickAction[] = [
  { label: "Importar documentos", description: "Centralizar capturas e anexos", href: "/ocr-documentos" },
  { label: "Novo lancamento", description: "Criar conta a pagar ou receber", href: "/contas-a-pagar" },
  { label: "Conciliar", description: "Resolver pendencias bancarias", href: "/conciliacao" },
  { label: "Cobrar cliente", description: "Ativar follow-up da carteira", href: "/contas-a-receber" },
  { label: "Pagar fornecedor", description: "Agendar e registrar baixa", href: "/contas-a-pagar" },
  { label: "Exportar posicao", description: "Levar dados para o cliente", href: "/relatorios" },
  { label: "Novo recebimento", description: "Registrar baixa manual", href: "/contas-a-receber" },
  { label: "Ver relatorios", description: "Acessar analiticos do mes", href: "/relatorios" }
];

export const dueSoonRows: TableRow[] = [
  { vencimento: "27/05/2024", tipo: "A Pagar", descricao: "Aluguel Matriz - Maio/24", parte: "Imobiliaria Horizonte LTDA", valor: "R$ 8.500,00", status: "A vencer" },
  { vencimento: "28/05/2024", tipo: "A Receber", descricao: "Venda 000125 - NF-e 4587", parte: "Mercado Bom Preco LTDA", valor: "R$ 6.890,00", status: "A receber" },
  { vencimento: "31/05/2024", tipo: "A Pagar", descricao: "Assessoria Contabil - Maio/24", parte: "Contabilidade Alfa", valor: "R$ 4.200,00", status: "A vencer" }
];

export const alertRows: TableRow[] = [
  { tipo: "Inadimplencia > 90 dias", mensagem: "3 titulos somam R$ 31.642,20", qtd: "3", acao: "Ver" },
  { tipo: "Vencidos (7-90 dias)", mensagem: "12 titulos somam R$ 28.173,40", qtd: "12", acao: "Ver" },
  { tipo: "OCR pendente", mensagem: "27 documentos aguardando revisao", qtd: "27", acao: "Ver" },
  { tipo: "Conciliacao pendente", mensagem: "42 transacoes nao conciliadas", qtd: "42", acao: "Ver" }
];

export const auditLogRows: TableRow[] = [
  { data: "18/06/2026 09:15", entidade: "APPROVALS", acao: "POST /approvals/1/approve", responsavel: "operador@bpo.angra", referencia: "apr-001" },
  { data: "18/06/2026 08:42", entidade: "CASH", acao: "POST /cash/entries/s1", responsavel: "operador@bpo.angra", referencia: "cash-entry" },
  { data: "17/06/2026 16:30", entidade: "FISCAL-NOTES", acao: "POST /fiscal-notes/1/post", responsavel: "operador@bpo.angra", referencia: "fn-001" }
];

export const approvalRows: TableRow[] = [
  { descricao: "Frete logistica - NF 8821", valor: "R$ 12.800", solicitante: "Operador BPO", data: "17/06/2026", status: "Pendente" },
  { descricao: "Marketing digital - campanha junho", valor: "R$ 8.450", solicitante: "Operador BPO", data: "16/06/2026", status: "Pendente" },
  { descricao: "Manutencao equipamentos", valor: "R$ 6.200", solicitante: "Operador BPO", data: "15/06/2026", status: "Pendente" },
  { descricao: "Assessoria juridica trimestral", valor: "R$ 5.970", solicitante: "Operador BPO", data: "14/06/2026", status: "Pendente" },
  { descricao: "Energia eletrica - unidade 2", valor: "R$ 3.100", solicitante: "Operador BPO", data: "13/06/2026", status: "Pendente" },
  { descricao: "Software contabil - licenca", valor: "R$ 1.900", solicitante: "Operador BPO", data: "12/06/2026", status: "Pendente" }
];

export const activityRows: TableRow[] = [
  { data: "24/05/2024 08:31", descricao: "Pagamento fornecedor - NF 2387", valor: "-R$ 2.450,00", origem: "Contabilidade" },
  { data: "24/05/2024 08:22", descricao: "Recebimento cliente - NF 4587", valor: "R$ 6.890,00", origem: "Importacao Bancaria" },
  { data: "24/05/2024 08:10", descricao: "Conciliacao - PIX Recebido", valor: "R$ 3.750,00", origem: "Conciliacao" },
  { data: "24/05/2024 07:58", descricao: "Documento enviado - NF 5623", valor: "-", origem: "OCR" },
  { data: "24/05/2024 07:41", descricao: "Lancamento criado - Despesa", valor: "-R$ 1.250,00", origem: "Operador" }
];

export const pageSummaries = {
  "/tributos": {
    title: "Tributário — Agente preditivo",
    subtitle: "Apuração do Simples, classificação fiscal automática e malha fina com a Angra IA.",
    metrics: [
      { label: "DAS previsto", value: "R$ 0" },
      { label: "Aliquota efetiva", value: "0%" },
      { label: "Faturamento 12m", value: "R$ 0" }
    ]
  },
  "/pdv": {
    title: "PDV — Ponto de Venda",
    subtitle: "Frente de caixa moderna: carrinho, leitor por camera, IA e Pix em um clique.",
    metrics: [
      { label: "Vendas hoje", value: "R$ 0" },
      { label: "Pedidos", value: "0" },
      { label: "Ticket medio", value: "R$ 0" }
    ]
  },
  "/contas-a-pagar": {
    title: "Contas a Pagar",
    subtitle: "Controle de obrigacoes, aprovacoes e baixas por fornecedor.",
    metrics: [
      { label: "Em aberto", value: "R$ 96.320" },
      { label: "Vence hoje", value: "R$ 12.440" },
      { label: "Aguardando aprovacao", value: "18 titulos" }
    ]
  },
  "/contas-a-receber": {
    title: "Contas a Receber",
    subtitle: "Carteira activa com aging, follow-up e previsao de entrada.",
    metrics: [
      { label: "Total a receber", value: "R$ 141.870" },
      { label: "Em atraso", value: "R$ 22.630" },
      { label: "PMR", value: "34 dias" }
    ]
  },
  "/aprovacoes": {
    title: "Aprovacoes",
    subtitle: "Workflow de aprovacao de pagamentos — operador solicita, cliente decide.",
    metrics: [
      { label: "Pendentes", value: "6 titulos" },
      { label: "Valor total", value: "R$ 38.420" },
      { label: "Maior titulo", value: "R$ 12.800" }
    ]
  },
  "/conciliacao": {
    title: "Conciliacao",
    subtitle: "Pareamento operacional entre extratos, caixa e lancamentos.",
    metrics: [
      { label: "Importados", value: "684 movimentos" },
      { label: "Pendentes", value: "79" },
      { label: "Taxa automatica", value: "82,2%" }
    ]
  },
  "/fiscal-trabalhista": {
    title: "Fiscal & Trabalhista",
    subtitle: "Controle de impostos Simples Nacional (DAS, DEFIS) e obrigacoes trabalhistas.",
    metrics: [
      { label: "DAS do mes", value: "R$ 4.250" },
      { label: "Faturamento (12m)", value: "R$ 1.842.300" },
      { label: "Funcionarios", value: "4 ativos" }
    ]
  },
  "/contador": {
    title: "Integracao Contador",
    subtitle: "Modulo de fechamento contabil e exportacao de relatorios e XMLs.",
    metrics: [
      { label: "Mes de referencia", value: "Maio/2026" },
      { label: "Status fechamento", value: "Pendente" },
      { label: "Notas exportadas", value: "118 emitidas" }
    ]
  },
  "/ocr-documentos": {
    title: "OCR e Documentos",
    subtitle: "Fila de captura, leitura e revisao manual dos anexos financeiros.",
    metrics: [
      { label: "Recebidos", value: "214 docs" },
      { label: "Em revisao", value: "28" },
      { label: "Confianca media", value: "91,4%" }
    ]
  },
  "/relatorios": {
    title: "Relatorios",
    subtitle: "Visao gerencial simples para caixa, categorias e previsao mensal.",
    metrics: [
      { label: "Resultado caixa", value: "R$ 13.630" },
      { label: "Receita recebida", value: "R$ 88.540" },
      { label: "Despesa paga", value: "R$ 74.910" }
    ]
  },
  "/painel-cliente": {
    title: "Painel do Cliente",
    subtitle: "Experiencia externa simplificada com pendencias e aprovacoes.",
    metrics: [
      { label: "Saldo atual", value: "R$ 182.450" },
      { label: "Pendencias", value: "6" },
      { label: "Ultima atualizacao", value: "08:42" }
    ]
  },
  "/configuracoes": {
    title: "Configuracoes",
    subtitle: "Base minima para empresas, bancos, categorias e regras de aprovacao.",
    metrics: [
      { label: "Usuarios ativos", value: "3" },
      { label: "Bancos conectados", value: "2" },
      { label: "Setup concluido", value: "76%" }
    ]
  }
};

export const payablesRows: TableRow[] = [
  { fornecedor: "Imobiliaria Horizonte", documento: "Boleto 2305", categoria: "Aluguel", vencimento: "27/05/2024", valor: "R$ 8.500,00", status: "A vencer" },
  { fornecedor: "Contabilidade Alfa", documento: "NF 2387", categoria: "Servicos", vencimento: "31/05/2024", valor: "R$ 4.200,00", status: "A vencer" },
  { fornecedor: "Energia Sul", documento: "Fatura 5548", categoria: "Utilidades", vencimento: "24/05/2024", valor: "R$ 2.450,00", status: "Ver" },
  { fornecedor: "OfficeNet Telecom", documento: "NF 918", categoria: "Infraestrutura", vencimento: "02/06/2024", valor: "R$ 1.940,00", status: "A vencer" },
  { fornecedor: "Martins Distribuicao", documento: "NF 7741", categoria: "Material", vencimento: "05/06/2024", valor: "R$ 6.240,00", status: "A vencer" }
];

export const receivablesRows: TableRow[] = [
  { cliente: "Mercado Bom Preco LTDA", fatura: "NF-e 4587", emissao: "21/05/2024", vencimento: "28/05/2024", valor: "R$ 6.890,00", status: "A receber" },
  { cliente: "Rede Vida Farma", fatura: "NF-e 4610", emissao: "22/05/2024", vencimento: "30/05/2024", valor: "R$ 9.400,00", status: "A receber" },
  { cliente: "Construtora Atlantico", fatura: "NF-e 4601", emissao: "18/05/2024", vencimento: "24/05/2024", valor: "R$ 12.300,00", status: "Ver" },
  { cliente: "Colegio Horizonte", fatura: "NF-e 4592", emissao: "20/05/2024", vencimento: "27/05/2024", valor: "R$ 5.720,00", status: "A receber" },
  { cliente: "Clinica Santa Elena", fatura: "NF-e 4574", emissao: "17/05/2024", vencimento: "22/05/2024", valor: "R$ 8.150,00", status: "Ver" }
];

export const clientPendingRows: TableRow[] = [
  { item: "Aprovacao de aluguel matriz", responsavel: "Socio aprovador", prazo: "Hoje, 16:00", status: "Ver" },
  { item: "Envio de recibo de frete", responsavel: "Financeiro empresa", prazo: "Amanha, 10:00", status: "Ver" },
  { item: "Confirmacao de recebimento PIX", responsavel: "Operador BPO", prazo: "Hoje, 18:00", status: "Ver" }
];

export const clientHistoryRows: TableRow[] = [
  { data: "24/05/2024", evento: "Pagamento de aluguel", valor: "-R$ 8.500,00", origem: "Conta operacional" },
  { data: "24/05/2024", evento: "Recebimento NF-e 4587", valor: "R$ 6.890,00", origem: "PIX" },
  { data: "23/05/2024", evento: "Baixa de energia", valor: "-R$ 2.450,00", origem: "Boleto" }
];

export const reconciliationRows: TableRow[] = [
  { conta: "Banco Inter - Operacional", extrato: "PIX recebido 004582", sugestao: "NF-e 4587", divergencia: "R$ 0,00", status: "Sugerido" },
  { conta: "Stone Cartao", extrato: "Lote 2305-18", sugestao: "Recebiveis varejo", divergencia: "R$ 143,20", status: "Ver" },
  { conta: "Caixa interno", extrato: "Suprimento loja centro", sugestao: "Despesa operacional", divergencia: "R$ 0,00", status: "Conciliado" },
  { conta: "Banco Inter - Operacional", extrato: "Tarifa TED", sugestao: "Sem lancamento", divergencia: "R$ 18,90", status: "Ver" },
  { conta: "Getnet", extrato: "Antecipacao 9021", sugestao: "Recebiveis antecipados", divergencia: "R$ 0,00", status: "Sugerido" }
];

export const documentRows: TableRow[] = [
  { documento: "Boleto aluguel maio", tipo: "Boleto", fornecedor: "Imobiliaria Horizonte", valor: "R$ 8.500,00", confianca: "98%", status: "Aprovado" },
  { documento: "NF energia 5548", tipo: "Conta", fornecedor: "Energia Sul", valor: "R$ 2.450,00", confianca: "92%", status: "Revisao" },
  { documento: "Recibo frete 992", tipo: "Recibo", fornecedor: "Transportes Vale", valor: "R$ 640,00", confianca: "76%", status: "Ver" },
  { documento: "NF office 918", tipo: "Nota", fornecedor: "OfficeNet Telecom", valor: "R$ 1.940,00", confianca: "95%", status: "Aprovado" },
  { documento: "Boleto contabilidade", tipo: "Boleto", fornecedor: "Contabilidade Alfa", valor: "R$ 4.200,00", confianca: "89%", status: "Revisao" }
];

export const reportRows: TableRow[] = [
  { periodo: "Semana 1", entradas: "R$ 24.800,00", saidas: "R$ 18.430,00", saldo: "R$ 6.370,00" },
  { periodo: "Semana 2", entradas: "R$ 19.440,00", saidas: "R$ 21.160,00", saldo: "-R$ 1.720,00" },
  { periodo: "Semana 3", entradas: "R$ 27.900,00", saidas: "R$ 20.880,00", saldo: "R$ 7.020,00" },
  { periodo: "Semana 4", entradas: "R$ 16.400,00", saidas: "R$ 14.440,00", saldo: "R$ 1.960,00" }
];

export const settingsRows: TableRow[] = [
  { grupo: "Empresas", item: "Angra Comercio LTDA", detalhe: "Matriz ativa", status: "Ativo" },
  { grupo: "Bancos", item: "Banco Inter", detalhe: "Conta operacional conectada", status: "Ativo" },
  { grupo: "Aprovacao", item: "Faixa acima de R$ 5 mil", detalhe: "Socio aprovador", status: "Ativo" },
  { grupo: "Usuarios", item: "Financeiro cliente", detalhe: "2 usuarios convidados", status: "Ativo" },
  { grupo: "Categorias", item: "Despesas operacionais", detalhe: "18 categorias base", status: "Ativo" }
];

export const iconMap = {
  "Saldo projetado D+30": Wallet,
  "A pagar em aberto": ArrowDownToLine,
  "A receber em aberto": CircleDollarSign,
  "Inadimplencia (+90 dias)": ShieldAlert,
  "OCR pendente": FileSearch,
  "Conciliacao pendente": Landmark,
  "SLA medio (dias)": TimerReset,
  "Automacao (%)": BellRing
};

export const dasTaxRows: TableRow[] = [
  { periodo: "05/2026", imposto: "DAS - Simples Nacional", vencimento: "20/06/2026", valor: "R$ 4.250,00", status: "A vencer" },
  { periodo: "04/2026", imposto: "DAS - Simples Nacional", vencimento: "20/05/2026", valor: "R$ 4.110,00", status: "Pago" },
  { periodo: "03/2026", imposto: "DAS - Simples Nacional", vencimento: "20/04/2026", valor: "R$ 3.890,00", status: "Pago" },
  { periodo: "02/2026", imposto: "DAS - Simples Nacional", vencimento: "20/03/2026", valor: "R$ 3.450,00", status: "Pago" }
];

export const employeePayrollRows: TableRow[] = [
  { funcionario: "Ana Silva", cargo: "Analista de Suporte", salario: "R$ 3.200,00", fgts: "Conciliado", status: "Pago" },
  { funcionario: "Carlos Oliveira", cargo: "Desenvolvedor Junior", salario: "R$ 4.500,00", fgts: "Conciliado", status: "Pago" },
  { funcionario: "Juliana Santos", cargo: "Designer", salario: "R$ 3.800,00", fgts: "Pendente", status: "A vencer" },
  { funcionario: "Roberto Lima", cargo: "Auxiliar Administrativo", salario: "R$ 2.100,00", fgts: "Conciliado", status: "Pago" }
];

export const accountantExportLogs: TableRow[] = [
  { mes: "Maio/2026", tipo: "Completo (XML + Extrato)", data: "15/06/2026 10:24", destinatario: "Contabilidade Alfa", status: "Conciliado" },
  { mes: "Abril/2026", tipo: "Completo (XML + Extrato)", data: "13/05/2026 14:11", destinatario: "Contabilidade Alfa", status: "Conciliado" },
  { mes: "Março/2026", tipo: "Completo (XML + Extrato)", data: "14/04/2026 09:43", destinatario: "Contabilidade Alfa", status: "Conciliado" }
];

export const billingHistory12m = {
  categories: ["Jun/25", "Jul/25", "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26", "Fev/26", "Mar/26", "Abr/26", "Mai/26"],
  values: [120000, 134000, 142000, 139000, 155000, 161000, 192000, 130000, 138000, 151000, 168000, 172300]
};
