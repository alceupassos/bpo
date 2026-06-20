import { Module } from "@nestjs/common";
import { FiscalEmissionModule } from "../fiscal-emission/fiscal-emission.module";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";

@Module({
  imports: [FiscalEmissionModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService]
})
export class SalesModule {}
