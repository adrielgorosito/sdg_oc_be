import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class UpdatePrecioProductoDTO {
  @IsNotEmpty()
  @IsNumber()
  porcentaje: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  marca: RelationDTO;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  proveedor: RelationDTO;
}
