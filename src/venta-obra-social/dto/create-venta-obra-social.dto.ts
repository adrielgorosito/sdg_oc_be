import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { CondicionIva } from 'src/facturador/enums/condicion-iva.enum';
import { RelationDTO } from './../../common/dtos/relation.dto';

export class CreateVentaObraSocialDTO {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  obraSocial: RelationDTO;

  @IsNotEmpty()
  @IsNumber()
  importe: number;

  @IsNotEmpty()
  @IsEnum(CondicionIva)
  condicionIva: CondicionIva;
}
