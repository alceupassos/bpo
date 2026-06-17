import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import { ProductsService } from "./products.service";

class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsString()
  category?: string;
}

class StockMoveDto {
  @IsIn(["IN", "OUT", "ADJUST"])
  type!: "IN" | "OUT" | "ADJUST";

  @IsNumber()
  qty!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.productsService.list(companyScope(user));
  }

  @Get("low-stock")
  lowStock(@CurrentUser() user?: DecodedJwt) {
    return this.productsService.lowStock(companyScope(user));
  }

  @Get("movements")
  movements(@CurrentUser() user?: DecodedJwt) {
    return this.productsService.movements(companyScope(user));
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateProductDto, @CurrentUser() user?: DecodedJwt) {
    return this.productsService.create(body, companyScope(user));
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: CreateProductDto) {
    return this.productsService.update(id, body);
  }

  @Post(":id/stock")
  move(@Param("id") id: string, @Body() body: StockMoveDto) {
    return this.productsService.move(id, body.type, body.qty, { reason: body.reason, refType: "MANUAL" });
  }
}
