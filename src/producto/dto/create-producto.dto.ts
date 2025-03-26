import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CategoriaEnum } from '../enums/categoria.enum';

export class CreateProductoDTO extends BaseDTO {
  @IsNotEmpty()
  @IsString()
  codProv: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsEnum(CategoriaEnum)
  categoria: CategoriaEnum;

  @IsNotEmpty()
  @IsNumber()
  precio: number;

  @IsNotEmpty()
  @IsNumber()
  precioSugerido: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  marca: RelationDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  proveedor: RelationDTO;
}
