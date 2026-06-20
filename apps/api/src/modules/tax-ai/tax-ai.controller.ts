import { Controller, Get, Param, Post } from "@nestjs/common";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { TaxAiService } from "./tax-ai.service";

@Controller("tax-ai")
export class TaxAiController {
  constructor(private readonly taxAi: TaxAiService) {}

  @Get("insights")
  insights(@CurrentUser() user?: DecodedJwt) {
    return this.taxAi.insights(companyScope(user));
  }

  @Post("classify/:productId")
  classify(@Param("productId", ParseResourceIdPipe) productId: string) {
    return this.taxAi.classifyProduct(productId, true);
  }

  @Post("classify-all")
  classifyAll(@CurrentUser() user?: DecodedJwt) {
    return this.taxAi.classifyAll(companyScope(user));
  }
}
