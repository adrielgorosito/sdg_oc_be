import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class ClienteDTO extends BaseDTO {
  @IsNumber()
  dni: number;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsString()
  email: string;

  @IsString()
  telefono: string;

  @IsString()
  domicilio: string;

  @IsString()
  sexo: string;

  fechaNac: Date;

  fechaAlta: Date;

  @IsOptional()
  @IsString()
  observaciones: string;
}
