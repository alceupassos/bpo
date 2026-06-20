import { Controller, Get, Param, Post } from "@nestjs/common";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { FiscalEmissionService } from "./fiscal-emission.service";

@Controller("fiscal")
export class FiscalEmissionController {
  constructor(private readonly fiscal: FiscalEmissionService) {}

  @Post("emit/:orderId")
  emit(@Param("orderId", ParseResourceIdPipe) orderId: string, @CurrentUser() user?: DecodedJwt) {
    return this.fiscal.emit(orderId, companyScope(user));
  }

  @Get("cupom/:orderId")
  async cupom(@Param("orderId", ParseResourceIdPipe) orderId: string, @CurrentUser() user?: DecodedJwt) {
    const html = await this.fiscal.cupomHtml(orderId, companyScope(user));
    return { html };
  }

  @Post("cancel/:orderId")
  cancel(@Param("orderId", ParseResourceIdPipe) orderId: string, @CurrentUser() user?: DecodedJwt) {
    return this.fiscal.cancel(orderId, companyScope(user));
  }
}
