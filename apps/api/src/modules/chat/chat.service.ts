import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AiVisionService } from "../ai/ai-vision.service";
import { StorageService, type UploadedFileLike } from "../documents/storage.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly vision: AiVisionService
  ) {}

  threads(companyId?: string | null) {
    return this.prisma.chatThread.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { lastMessageAt: "desc" }
    });
  }

  messages(threadId: string) {
    return this.prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" }
    });
  }

  async send(threadId: string, body: string, direction: "IN" | "OUT" = "OUT") {
    const msg = await this.prisma.chatMessage.create({ data: { threadId, body, direction } });
    await this.prisma.chatThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date() } });
    return msg;
  }

  /** Anexo recebido vira FiscalNote (leitor de NF) e uma mensagem IN com o link. */
  async upload(threadId: string, file: UploadedFileLike, companyId?: string | null) {
    const thread = await this.prisma.chatThread.findUnique({ where: { id: threadId } });
    const scope = companyId ?? thread?.companyId ?? "company-1";
    const { path } = this.storage.save(file);
    const r = await this.vision.extract(file);
    const note = await this.prisma.fiscalNote.create({
      data: {
        companyId: scope,
        type: r.type,
        supplierName: r.supplierName ?? thread?.contactName ?? null,
        supplierCnpj: r.supplierCnpj,
        total: r.total ?? 0,
        issueDate: r.issueDate ? new Date(r.issueDate) : null,
        status: "NEEDS_REVIEW",
        source: r.source,
        storagePath: path,
        items: {
          create: r.items.map((it) => ({
            description: it.description,
            qty: it.qty,
            unitPrice: it.unitPrice,
            total: it.total
          }))
        }
      }
    });
    const msg = await this.prisma.chatMessage.create({
      data: { threadId, direction: "IN", body: "Documento recebido", mediaPath: path, noteId: note.id }
    });
    await this.prisma.chatThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date() } });
    return { message: msg, noteId: note.id };
  }
}
