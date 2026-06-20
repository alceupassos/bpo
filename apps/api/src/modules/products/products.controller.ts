import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { companyScope, CurrentUser } from "../auth/current-user.decorator";
import type { DecodedJwt } from "../auth/jwt.util";
import type { UploadedFileLike } from "../documents/storage.service";
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

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @IsOptional()
  @IsString()
  cfop?: string;

  @IsOptional()
  @IsString()
  csosn?: string;

  @IsOptional()
  @IsString()
  cst?: string;

  @IsOptional()
  @IsIn(["NACIONAL", "IMPORTADO"])
  origem?: "NACIONAL" | "IMPORTADO";

  @IsOptional()
  @IsNumber()
  icmsAliquota?: number;

  @IsOptional()
  @IsNumber()
  pisAliquota?: number;

  @IsOptional()
  @IsNumber()
  cofinsAliquota?: number;
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

  @Post("import-ocr")
  @UseInterceptors(FileInterceptor("file"))
  importOcr(@UploadedFile() file: UploadedFileLike, @CurrentUser() user?: DecodedJwt) {
    return this.productsService.importFromOcr(file, companyScope(user));
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

  @Post("photos/auto")
  autoPhotos(@CurrentUser() user?: DecodedJwt) {
    return this.productsService.autoPhotos(companyScope(user));
  }

  @Post(":id/fetch-photo")
  fetchPhoto(@Param("id") id: string) {
    return this.productsService.fetchPhoto(id);
  }
}
