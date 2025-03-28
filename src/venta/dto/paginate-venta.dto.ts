import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

export class PaginateVentaDTO extends PaginationDTO {
  @IsString()
  @IsOptional()
  nombreCliente?: string;

  @IsString()
  @IsOptional()
  nroDocumento?: string;

  @IsString()
  @IsOptional()
  fechaDesde?: string;

  @IsString()
  @IsOptional()
  fechaHasta?: string;

  @IsNumber()
  @IsOptional()
  clienteId?: number;
}
