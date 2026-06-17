import { Module } from "@nestjs/common";
import { StorageService } from "../documents/storage.service";
import { CashController } from "./cash.controller";
import { CashService } from "./cash.service";

@Module({
  controllers: [CashController],
  providers: [CashService, StorageService]
})
export class CashModule {}
