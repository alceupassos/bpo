"use server";

import { apiPost } from "@/lib/api";

export interface OracleAnswer {
  answer: string;
  usedData: boolean;
}

/** Pergunta ao Oráculo Angra IA. Resiliente: nunca lança, devolve fallback amigável. */
export async function askOracle(question: string): Promise<OracleAnswer> {
  const q = (question || "").trim();
  if (!q) {
    return { answer: "Pode me perguntar sobre vendas, contas a pagar/receber, conciliação ou estoque.", usedData: false };
  }
  const res = await apiPost<OracleAnswer>("/assistant/ask", { question: q });
  if (res?.answer) return res;
  return {
    answer:
      "Não consegui falar com o servidor agora. Tente novamente em instantes — posso responder sobre vendas, contas e conciliação.",
    usedData: false
  };
}
