import { Module } from "@nestjs/common";
import { TaxEngineModule } from "../tax-engine/tax-engine.module";
import { FiscalEmissionController } from "./fiscal-emission.controller";
import { FiscalEmissionService } from "./fiscal-emission.service";

@Module({
  imports: [TaxEngineModule],
  controllers: [FiscalEmissionController],
  providers: [FiscalEmissionService],
  exports: [FiscalEmissionService]
})
export class FiscalEmissionModule {}
