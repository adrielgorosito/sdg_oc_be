import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateClienteDTO extends BaseDTO {
  @IsNotEmpty()
  @IsNumber()
  dni: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsNotEmpty()
  @IsString()
  domicilio: string;

  @IsNotEmpty()
  @IsString()
  sexo: string;

  @IsNotEmpty()
  @IsDate()
  fechaNac: Date;

  @IsNotEmpty()
  @IsDate()
  fechaAlta: Date;

  @IsOptional()
  @IsString()
  observaciones: string;
}
