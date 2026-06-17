import { Module } from "@nestjs/common";
import { StorageService } from "../documents/storage.service";
import { ProductsModule } from "../products/products.module";
import { SuppliersModule } from "../suppliers/suppliers.module";
import { FiscalNotesController } from "./fiscal-notes.controller";
import { FiscalNotesService } from "./fiscal-notes.service";

@Module({
  imports: [SuppliersModule, ProductsModule],
  controllers: [FiscalNotesController],
  providers: [FiscalNotesService, StorageService]
})
export class FiscalNotesModule {}
