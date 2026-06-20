import { Module } from "@nestjs/common";
import { DashboardModule } from "../dashboard/dashboard.module";
import { TaxEngineModule } from "../tax-engine/tax-engine.module";
import { TaxAiController } from "./tax-ai.controller";
import { TaxAiService } from "./tax-ai.service";

@Module({
  imports: [TaxEngineModule, DashboardModule],
  controllers: [TaxAiController],
  providers: [TaxAiService],
  exports: [TaxAiService]
})
export class TaxAiModule {}
