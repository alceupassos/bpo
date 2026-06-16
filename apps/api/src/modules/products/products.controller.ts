import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { IsNumber, IsOptional, IsString } from "class-validator";
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
  @IsString()
  category?: string;
}

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@CurrentUser() user?: DecodedJwt) {
    return this.productsService.list(companyScope(user));
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
}
