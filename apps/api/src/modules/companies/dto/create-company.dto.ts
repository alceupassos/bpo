import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  legalName!: string;

  @IsString()
  tradeName!: string;

  @IsString()
  cnpj!: string;

  @IsString()
  taxRegime!: string;

  @IsString()
  adminName!: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(6)
  adminPassword!: string;
}
