import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, resolve } from "path";

export interface UploadedFileLike {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

/**
 * Armazenamento plugável. Hoje só `local` (grava em apps/api/storage/<bucket>).
 * A interface deixa o caminho aberto para S3/GCS depois sem mexer no service.
 */
@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  save(file: UploadedFileLike): { path: string } {
    const bucket = this.config.get<string>("STORAGE_BUCKET") ?? "angra-bpo-local";
    // O processo roda com cwd em apps/api (dev:api e PM2), então o storage
    // fica em apps/api/storage/<bucket>.
    const dir = resolve(process.cwd(), "storage", bucket);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const safeName = `${Date.now()}-${file.originalname.replace(/[^\w.\-]/g, "_")}`;
    const fullPath = join(dir, safeName);
    writeFileSync(fullPath, file.buffer);
    return { path: join("storage", bucket, safeName) };
  }
}
