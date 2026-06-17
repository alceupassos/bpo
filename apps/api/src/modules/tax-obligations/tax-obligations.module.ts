import { Module } from "@nestjs/common";
import { TaxObligationsController } from "./tax-obligations.controller";
import { TaxObligationsService } from "./tax-obligations.service";

@Module({
  controllers: [TaxObligationsController],
  providers: [TaxObligationsService],
  exports: [TaxObligationsService]
})
export class TaxObligationsModule {}
