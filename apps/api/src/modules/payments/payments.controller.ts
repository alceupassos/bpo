import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import { Public } from "../auth/public.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { PaymentsService, type PayMethod } from "./payments.service";

class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsIn(["PIX", "CARTAO"])
  method?: PayMethod;

  @IsOptional()
  @IsString()
  payerEmail?: string;
}

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("gateways")
  gateways() {
    return this.paymentsService.gateways();
  }

  @Post("create")
  create(@Body() body: CreatePaymentDto, @CurrentUser() user?: DecodedJwt) {
    return this.paymentsService.createPayment(
      body.orderId,
      { provider: body.provider, method: body.method, payerEmail: body.payerEmail },
      companyScope(user)
    );
  }

  @Get("status/:txId")
  status(@Param("txId", ParseResourceIdPipe) txId: string, @Query("provider") provider?: string) {
    return this.paymentsService.status(provider ?? "MERCADOPAGO", txId);
  }

  // Webhook público — provedor vem por ?provider= (default Mercado Pago).
  @Public()
  @Post("webhook")
  webhook(
    @Body() body: Record<string, unknown>,
    @Query("provider") provider?: string,
    @Query("data.id") dataId?: string
  ) {
    return this.paymentsService.webhook(provider ?? "MERCADOPAGO", body ?? {}, dataId);
  }
}
