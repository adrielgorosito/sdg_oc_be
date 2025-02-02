import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateMarcaDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: RelationDTO[];

  @IsNotEmpty()
  @IsString()
  nombre: string;
}
