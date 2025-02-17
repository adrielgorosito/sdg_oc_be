import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { Estado } from '../enum/estado.enum';

export class CreateCuentaCorrienteDTO extends BaseDTO {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  saldo: number;

  @IsNotEmpty()
  @IsObject()
  @Type(() => RelationDTO)
  cliente: RelationDTO;

  @IsOptional()
  @IsEnum(Estado)
  estado: Estado;
}
