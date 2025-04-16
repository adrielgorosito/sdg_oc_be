import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
export class CreateProveedorDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: RelationDTO[];

  @IsNotEmpty()
  @IsNumber()
  cuit: number;

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
