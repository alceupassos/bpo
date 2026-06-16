import { Controller, Get, Param, Post } from "@nestjs/common";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { BankingService } from "./banking.service";

@Controller()
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Get("bank-transactions")
  listTransactions(@CurrentUser() user?: DecodedJwt) {
    return this.bankingService.listTransactions(companyScope(user));
  }

  @Get("bank-accounts")
  listAccounts(@CurrentUser() user?: DecodedJwt) {
    return this.bankingService.listAccounts(companyScope(user));
  }

  @Post("bank-transactions/import")
  importStatement() {
    return this.bankingService.importStatement();
  }

  @Post("reconciliations/suggest")
  suggestMatch() {
    return this.bankingService.suggestMatch();
  }

  @Post("reconciliations/confirm/:transactionId")
  confirmMatch(@Param("transactionId") transactionId: string) {
    return this.bankingService.confirmMatch(transactionId);
  }
}
