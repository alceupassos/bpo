import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { IsOptional, IsString } from "class-validator";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { PaymentsService } from "./payments.service";

class PixDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  payerEmail?: string;
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("pix")
  pix(@Body() body: PixDto, @CurrentUser() user?: DecodedJwt) {
    return this.paymentsService.createPix(body.orderId, body.payerEmail, companyScope(user));
  }

  @Get("status/:mpPaymentId")
  status(@Param("mpPaymentId", ParseResourceIdPipe) mpPaymentId: string) {
    return this.paymentsService.status(mpPaymentId);
  }

  // Webhook público do Mercado Pago — valida re-consultando o pagamento na API.
  @Public()
  @Post("webhook")
  webhook(@Body() body: Record<string, unknown>, @Query("data.id") dataId?: string) {
    return this.paymentsService.webhook(body ?? {}, dataId);
  }
}
