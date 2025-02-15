import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { RedDePago, TipoMedioDePagoEnum } from '../enum/medio-de-pago.enum';

export class CreateMedioDePagoDto {
  @IsOptional()
  @IsNumber()
  numeroPago: number;

  @IsNotEmpty()
  @IsEnum(TipoMedioDePagoEnum)
  tipoMedioDePago: TipoMedioDePagoEnum;

  @IsString()
  @ValidateIf(
    (o) =>
      o.tipoMedioDePago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
      o.tipoMedioDePago === TipoMedioDePagoEnum.TARJETA_DEBITO ||
      o.tipoMedioDePago === TipoMedioDePagoEnum.TRANSFERENCIA_BANCARIA,
  )
  @IsNotEmpty()
  entidadBancaria: string;

  @ValidateIf(
    (o) =>
      o.tipoMedioDePago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
      o.tipoMedioDePago === TipoMedioDePagoEnum.TARJETA_DEBITO,
  )
  @IsNotEmpty()
  @IsEnum(RedDePago)
  redDePago: RedDePago;

  @IsNotEmpty()
  @IsNumber()
  importe: number;
}
