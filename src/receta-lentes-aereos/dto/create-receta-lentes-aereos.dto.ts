import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateRecetaLentesAereosDTO extends BaseDTO {
  @IsDate()
  @IsNotEmpty()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  tipoReceta: string;

  @IsString()
  @IsNotEmpty()
  oftalmologo: string;

  @IsString()
  @IsNotEmpty()
  cristal: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  armazon: string;

  @IsString()
  @IsNotEmpty()
  tratamiento: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  cliente: RelationDTO;
}
