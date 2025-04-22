import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsTipoFacturaValida } from 'src/common/decorators/is-tipo-factura-valida.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { TipoComprobante } from 'src/comprobante/enums/tipo-comprobante.enum';

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

  @IsOptional()
  @IsTipoFacturaValida()
  @IsEnum(TipoComprobante)
  tipoComprobante?: TipoComprobante;

  @IsNumber()
  @IsOptional()
  pendientes?: number;
}
