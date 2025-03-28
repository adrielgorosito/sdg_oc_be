import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

export class PaginateClienteDTO extends PaginationDTO {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  nroDocumento?: string;

  @IsNumber()
  @IsOptional()
  localidadId?: number;

  @IsNumber()
  @IsOptional()
  provinciaId?: number;

  @IsOptional()
  @IsString()
  nombreLocalidad?: string;

  @IsOptional()
  @IsString()
  nombreProvincia?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  genero?: string;
}
