import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { OcrService } from "./ocr.service";
import { StorageService } from "./storage.service";

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, OcrService]
})
export class DocumentsModule {}
