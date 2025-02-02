import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsCUIT } from 'src/common/decorators/is-cuit.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateProveedorDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: RelationDTO[];

  @IsNotEmpty()
  @IsString()
  @IsCUIT()
  cuit: string;

  @IsNotEmpty()
  @IsString()
  razonSocial: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
