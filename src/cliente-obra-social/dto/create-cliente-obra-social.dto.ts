import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateClienteObraSocialDTO extends BaseDTO {
  @IsNotEmpty()
  @IsString()
  numeroSocio: string;

  @IsOptional()
  @IsObject()
  @Type(() => RelationDTO)
  cliente: RelationDTO;

  @IsNotEmpty()
  @IsObject()
  @Type(() => RelationDTO)
  obraSocial: RelationDTO;
}
