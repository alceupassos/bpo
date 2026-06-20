import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { PrismaModule } from "../prisma/prisma.module";
import { AccountingModule } from "./accounting/accounting.module";
import { AiModule } from "./ai/ai.module";
import { AiInsightsModule } from "./ai-insights/ai-insights.module";
import { ApprovalModule } from "./approvals/approval.module";
import { AssistantModule } from "./assistant/assistant.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { BankingModule } from "./banking/banking.module";
import { CashModule } from "./cash/cash.module";
import { ChatModule } from "./chat/chat.module";
import { CompaniesModule } from "./companies/companies.module";
import { CorporateModule } from "./corporate/corporate.module";
import { CustomersModule } from "./customers/customers.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DocumentsModule } from "./documents/documents.module";
import { FinancialEntriesModule } from "./financial-entries/financial-entries.module";
import { FiscalEmissionModule } from "./fiscal-emission/fiscal-emission.module";
import { FiscalNotesModule } from "./fiscal-notes/fiscal-notes.module";
import { PaymentsModule } from "./payments/payments.module";
import { PayrollModule } from "./payroll/payroll.module";
import { ProductsModule } from "./products/products.module";
import { SalesModule } from "./sales/sales.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { TaxAiModule } from "./tax-ai/tax-ai.module";
import { TaxObligationsModule } from "./tax-obligations/tax-obligations.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", "apps/api/.env"],
      isGlobal: true
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60
    }]),
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
    SalesModule,
    PaymentsModule,
    FiscalEmissionModule,
    CashModule,
    FiscalNotesModule,
    ChatModule,
    SuppliersModule,
    CustomersModule,
    TaxObligationsModule,
    TaxAiModule,
    PayrollModule,
    CorporateModule,
    AccountingModule,
    AiInsightsModule,
    AssistantModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AppModule {}
