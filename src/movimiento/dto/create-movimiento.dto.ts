import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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
  @ValidateFormaPagoMovimiento()
  tipoMovimiento: TipoMovimiento;

  @IsNotEmpty()
  @IsNumber()
  importe: number;

  @IsOptional()
  @IsEnum(TipoMedioDePagoEnum)
  formaPago?: TipoMedioDePagoEnum;

  @IsEnum(RedDePago)
  @ValidateIf(
    (o) =>
      o.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
      o.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO,
  )
  @IsNotEmpty()
  redDePago?: RedDePago;
}
