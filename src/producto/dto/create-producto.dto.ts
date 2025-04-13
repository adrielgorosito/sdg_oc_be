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
  @IsString()
  @IsOptional()
  codProv: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsEnum(CategoriaEnum)
  categoria: CategoriaEnum;

  @IsNotEmpty()
  @IsNumber()
  precioLista: number;

  @IsNotEmpty()
  @IsNumber()
  precio: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  marca: RelationDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  proveedor: RelationDTO;
}
