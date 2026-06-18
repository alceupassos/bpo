import { BadRequestException, Injectable } from "@nestjs/common";
import { decryptBiometric, encryptBiometric } from "../../common/biometric-crypto";
import { PrismaService } from "../../prisma/prisma.service";

type CustomerPayload = {
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  faceDescriptor?: number[] | string;
  biometricConsent?: boolean;
  webauthnCredId?: string;
  qrToken?: string;
  creditLimit?: number;
};

export type IdentifyPayload = {
  method: "FACE" | "WEBAUTHN" | "QR";
  faceDescriptor?: number[];
  webauthnCredId?: string;
  qrToken?: string;
};

// Distância euclidiana entre descritores faciais (face-api.js gera 128 floats).
// < 0.6 é o limiar usual para "mesma pessoa".
const FACE_THRESHOLD = 0.6;

function euclidean(a: number[], b: number[]): number {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.customer.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { name: "asc" }
    });
  }

  create(payload: CustomerPayload, companyId?: string | null) {
    let faceDescriptor: string | undefined;
    let biometricConsentAt: Date | undefined;

    if (payload.faceDescriptor !== undefined) {
      if (!payload.biometricConsent) {
        throw new BadRequestException("Consentimento biometrico obrigatorio para captura facial");
      }
      const raw = Array.isArray(payload.faceDescriptor)
        ? JSON.stringify(payload.faceDescriptor)
        : payload.faceDescriptor;
      faceDescriptor = encryptBiometric(raw);
      biometricConsentAt = new Date();
    }

    return this.prisma.customer.create({
      data: {
        companyId: companyId ?? "company-1",
        name: payload.name,
        document: payload.document,
        phone: payload.phone,
        email: payload.email,
        faceDescriptor,
        biometricConsentAt,
        webauthnCredId: payload.webauthnCredId,
        qrToken: payload.qrToken,
        creditLimit: payload.creditLimit ?? 0
      }
    });
  }

  /** Identifica um cliente já cadastrado por face/WebAuthn/QR. */
  async identify(payload: IdentifyPayload, companyId?: string | null) {
    const where = companyId ? { companyId } : {};

    if (payload.method === "QR" && payload.qrToken) {
      const customer = await this.prisma.customer.findFirst({
        where: { ...where, qrToken: payload.qrToken }
      });
      return { matched: Boolean(customer), method: "QR", customer };
    }

    if (payload.method === "WEBAUTHN" && payload.webauthnCredId) {
      const customer = await this.prisma.customer.findFirst({
        where: { ...where, webauthnCredId: payload.webauthnCredId }
      });
      return { matched: Boolean(customer), method: "WEBAUTHN", customer };
    }

    if (payload.method === "FACE" && Array.isArray(payload.faceDescriptor)) {
      const candidates = await this.prisma.customer.findMany({
        where: { ...where, faceDescriptor: { not: null } }
      });
      let best: { customer: (typeof candidates)[number]; distance: number } | null = null;
      for (const c of candidates) {
        if (!c.faceDescriptor || !c.biometricConsentAt) continue;
        const decrypted = decryptBiometric(c.faceDescriptor);
        if (!decrypted) continue;
        let stored: number[];
        try {
          stored = JSON.parse(decrypted) as number[];
        } catch {
          continue;
        }
        const distance = euclidean(stored, payload.faceDescriptor);
        if (!best || distance < best.distance) best = { customer: c, distance };
      }
      const matched = Boolean(best && best.distance <= FACE_THRESHOLD);
      return {
        matched,
        method: "FACE",
        distance: best?.distance ?? null,
        customer: matched ? best!.customer : null
      };
    }

    return { matched: false, method: payload.method, customer: null };
  }

  /** Lança uma venda na conta (crediário) do cliente identificado. */
  async charge(
    customerId: string,
    data: { amount: number; description?: string; sessionId?: string }
  ) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { charged: false, reason: "cliente nao encontrado" };

    const now = new Date();
    const entry = await this.prisma.financialEntry.create({
      data: {
        companyId: customer.companyId,
        type: "RECEIVABLE",
        status: "APPROVED",
        description: data.description ?? `Venda no caixa - ${customer.name}`,
        counterpartyName: customer.name,
        category: "Vendas",
        documentNumber: "CREDIARIO",
        amount: data.amount,
        issueDate: now,
        dueDate: now
      }
    });

    // Se houver caixa aberto, registra a venda também no caixa.
    if (data.sessionId) {
      await this.prisma.cashEntry.create({
        data: {
          sessionId: data.sessionId,
          type: "SALE",
          amount: data.amount,
          description: `Crediario - ${customer.name}`,
          paymentMethod: "CREDIARIO"
        }
      });
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: { balance: Number(customer.balance) + data.amount }
    });

    return { charged: true, entryId: entry.id, balance: updated.balance, customer: updated };
  }
}
