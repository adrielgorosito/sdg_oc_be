import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsFormaPago } from 'src/common/decorators/is-forma-pago.decorator';
import { IsTipoMovimiento } from 'src/common/decorators/is-tipo-movimiento.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { UpdateCuentaCorrienteDTO } from 'src/cuenta-corriente/dto/update-cuenta-corriente.dto';

export class CreateMovimientoDTO extends BaseDTO {
  @IsNotEmpty()
  @IsDate()
  fechaMovimiento: Date;

  @IsNotEmpty()
  @IsString()
  @IsTipoMovimiento()
  tipoMovimiento: string;

  @IsNotEmpty()
  @IsNumber()
  importe: number;

  @IsNotEmpty()
  @IsString()
  @IsFormaPago()
  formaPago: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateCuentaCorrienteDTO)
  cuentaCorriente: UpdateCuentaCorrienteDTO;
}
