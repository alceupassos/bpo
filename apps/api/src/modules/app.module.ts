import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ApprovalModule } from "./approvals/approval.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { RolesGuard } from "./auth/roles.guard";
import { BankingModule } from "./banking/banking.module";
import { CompaniesModule } from "./companies/companies.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DocumentsModule } from "./documents/documents.module";
import { FinancialEntriesModule } from "./financial-entries/financial-entries.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/api/.env"]
    }),
    AuthModule,
    CompaniesModule,
    UsersModule,
    DocumentsModule,
    FinancialEntriesModule,
    BankingModule,
    ApprovalModule,
    DashboardModule,
    AuditModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard }
  ]
})
export class AppModule {}
