import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ValidateFormaPagoMovimiento } from 'src/common/decorators/is-forma-pago.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import {
  RedDePago,
  TipoMedioDePagoEnum,
} from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { TipoMovimiento } from '../enums/tipo-movimiento.enum';

export class CreateMovimientoDTO extends BaseDTO {
  @IsNotEmpty()
  @IsEnum(TipoMovimiento)
  tipoMovimiento: TipoMovimiento;

  @IsNotEmpty()
  @IsNumber()
  importe: number;

  @IsOptional()
  @IsEnum(TipoMedioDePagoEnum)
  @ValidateFormaPagoMovimiento()
  formaPago?: TipoMedioDePagoEnum;

  @IsEnum(RedDePago)
  @ValidateIf(
    (o) =>
      o.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
      o.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO,
  )
  @IsNotEmpty()
  redDePago?: RedDePago;

  @IsUUID()
  @IsOptional()
  ventaId?: string;
}
