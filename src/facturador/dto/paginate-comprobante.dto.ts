import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsTipoFacturaValida } from 'src/common/decorators/is-tipo-factura-valida.decorator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';

export class PaginateComprobanteDTO extends PaginationDTO {
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

  @IsEnum(TipoComprobante)
  @IsOptional()
  @IsTipoFacturaValida()
  tipoFactura?: TipoComprobante;

  @IsEnum(TipoComprobante)
  @IsOptional()
  tipoComprobante?: TipoComprobante;
}
