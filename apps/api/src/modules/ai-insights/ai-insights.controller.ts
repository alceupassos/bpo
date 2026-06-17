import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { AiInsightsService } from "./ai-insights.service";

class CategorizeDto {
  @IsString()
  description!: string;
}

class CopilotDto {
  @IsString()
  question!: string;
}

@Controller("ai")
export class AiInsightsController {
  constructor(private readonly service: AiInsightsService) {}

  @Post("categorize")
  categorize(@Body() body: CategorizeDto) {
    return this.service.categorize(body.description);
  }

  @Post("copilot")
  copilot(@Body() body: CopilotDto, @CurrentUser() user?: DecodedJwt) {
    return this.service.copilot(body.question, companyScope(user));
  }

  @Get("forecast")
  forecast(@CurrentUser() user?: DecodedJwt) {
    return this.service.forecast(companyScope(user));
  }

  @Get("anomalies")
  anomalies(@CurrentUser() user?: DecodedJwt) {
    return this.service.anomalies(companyScope(user));
  }

  @Get("alerts")
  alerts(@CurrentUser() user?: DecodedJwt) {
    return this.service.alerts(companyScope(user));
  }

  @Get("monthly-summary")
  monthlySummary(@CurrentUser() user?: DecodedJwt) {
    return this.service.monthlySummary(companyScope(user));
  }
}
