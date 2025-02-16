import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { DetallesRecetaLentesAereos } from 'src/detalles-receta-lentes-aereos/entities/detalles-receta-lentes-aereos.entity';
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

  @IsObject()
  @ValidateNested()
  @Type(() => DetallesRecetaLentesAereos)
  @ValidateIf(
    (d) =>
      ((d.tipoReceta === TipoReceta.Cerca ||
        d.tipoReceta === TipoReceta.Lejos) &&
        d.detallesRecetaLentesAereos.length() == 1) ||
      (d.tipoReceta == TipoReceta.Multifocal &&
        d.detallesRecetaLentesAereos.length() == 2),
  )
  detallesRecetaLentesAereos: DetallesRecetaLentesAereos[];
}
