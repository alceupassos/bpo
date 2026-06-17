import { Controller, Get } from "@nestjs/common";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  summary(@CurrentUser() user?: DecodedJwt) {
    return this.dashboardService.summary(companyScope(user));
  }

  @Get("cashflow")
  cashflow(@CurrentUser() user?: DecodedJwt) {
    return this.dashboardService.cashflow(companyScope(user));
  }

  @Get("faturamento-12m")
  faturamento12m(@CurrentUser() user?: DecodedJwt) {
    return this.dashboardService.faturamento12m(companyScope(user));
  }
}
