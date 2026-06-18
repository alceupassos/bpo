import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";

/** IDs do projeto (cuid ou slugs de seed): alfanumérico, hífen e underscore. */
const RESOURCE_ID = /^[a-zA-Z0-9_-]{1,64}$/;

@Injectable()
export class ParseResourceIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const id = typeof value === "string" ? value.trim() : "";
    if (!id || !RESOURCE_ID.test(id)) {
      throw new BadRequestException("Identificador invalido");
    }
    return id;
  }
}