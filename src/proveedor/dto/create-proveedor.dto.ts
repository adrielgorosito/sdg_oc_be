import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
export class CreateProveedorDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: RelationDTO[];

  @IsNotEmpty()
  @IsNumberString()
  @Length(10, 11)
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
