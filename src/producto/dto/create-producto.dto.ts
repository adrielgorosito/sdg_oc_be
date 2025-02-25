import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CategoriaEnum } from '../enums/categoria.enum';

export class CreateProductoDTO extends BaseDTO {
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  proveedor: RelationDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  marca: RelationDTO;

  @IsNotEmpty()
  @IsNumber()
  precio: number;

  @IsNotEmpty()
  @IsNumber()
  precioSugerido: number;

  @IsOptional()
  @IsNumber()
  stock: number;

  @IsNotEmpty()
  @IsEnum(CategoriaEnum)
  categoria: CategoriaEnum;
}
