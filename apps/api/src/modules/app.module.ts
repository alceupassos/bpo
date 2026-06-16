import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "../prisma/prisma.module";
import { AiModule } from "./ai/ai.module";
import { ApprovalModule } from "./approvals/approval.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { BankingModule } from "./banking/banking.module";
import { CashModule } from "./cash/cash.module";
import { ChatModule } from "./chat/chat.module";
import { CompaniesModule } from "./companies/companies.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DocumentsModule } from "./documents/documents.module";
import { FinancialEntriesModule } from "./financial-entries/financial-entries.module";
import { FiscalNotesModule } from "./fiscal-notes/fiscal-notes.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/api/.env"]
    }),
    PrismaModule,
    AiModule,
    AuthModule,
    CompaniesModule,
    UsersModule,
    DocumentsModule,
    FinancialEntriesModule,
    BankingModule,
    ApprovalModule,
    DashboardModule,
    AuditModule,
    ProductsModule,
    CashModule,
    FiscalNotesModule,
    ChatModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AppModule {}
