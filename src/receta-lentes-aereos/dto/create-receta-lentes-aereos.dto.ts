import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ValidateTipoReceta } from 'src/common/decorators/validate-tipo-receta.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CreateDetallesRecetaLentesAereosDTO } from 'src/detalles-receta-lentes-aereos/dto/create-detalles-receta-lentes-aereos.dto';
import { TipoReceta } from '../enum/tipo-receta.enum';

export class CreateRecetaLentesAereosDTO extends BaseDTO {
  @IsDate()
  @IsNotEmpty()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  @IsEnum(TipoReceta)
  tipoReceta: TipoReceta;

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

  @IsArray()
  @ValidateTipoReceta()
  @ValidateNested({ each: true })
  @Type(() => CreateDetallesRecetaLentesAereosDTO)
  detallesRecetaLentesAereos: CreateDetallesRecetaLentesAereosDTO[];
}
