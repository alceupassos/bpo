import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { ParseResourceIdPipe } from "../../common/parse-resource-id.pipe";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { SalesService } from "./sales.service";

class OrderItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsNumber()
  @Min(0.001)
  qty!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

class CreateOrderDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}

class PayOrderDto {
  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  mpPaymentId?: string;
}

class AssistDto {
  @IsString()
  text!: string;
}

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.salesService.list(companyScope(user));
  }

  @Post()
  create(@Body() body: CreateOrderDto, @CurrentUser() user?: DecodedJwt) {
    return this.salesService.create(body, companyScope(user), user?.email ?? "operador");
  }

  @Post("assist")
  assist(@Body() body: AssistDto, @CurrentUser() user?: DecodedJwt) {
    return this.salesService.assist(body.text, companyScope(user));
  }

  @Get(":id")
  findOne(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.salesService.findOne(id, companyScope(user));
  }

  @Post(":id/pay")
  pay(
    @Param("id", ParseResourceIdPipe) id: string,
    @Body() body: PayOrderDto,
    @CurrentUser() user?: DecodedJwt
  ) {
    return this.salesService.pay(id, body, companyScope(user), user?.email ?? "operador");
  }

  @Post(":id/cancel")
  cancel(@Param("id", ParseResourceIdPipe) id: string, @CurrentUser() user?: DecodedJwt) {
    return this.salesService.cancel(id, companyScope(user), user?.email ?? "operador");
  }
}
