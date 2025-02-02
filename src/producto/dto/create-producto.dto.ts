import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

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
}
