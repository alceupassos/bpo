import { Module } from "@nestjs/common";
import { StorageService } from "../documents/storage.service";
import { FiscalNotesController } from "./fiscal-notes.controller";
import { FiscalNotesService } from "./fiscal-notes.service";

@Module({
  controllers: [FiscalNotesController],
  providers: [FiscalNotesService, StorageService]
})
export class FiscalNotesModule {}
