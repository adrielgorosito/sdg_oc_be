import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { TipoMovimiento } from '../enums/tipo-movimiento.enum';

export class CreateMovimientoDTO extends BaseDTO {
  @IsOptional()
  @IsDate()
  fechaMovimiento: Date;

  @IsNotEmpty()
  @IsEnum(TipoMovimiento)
  tipoMovimiento: TipoMovimiento;

  @IsNotEmpty()
  @IsNumber()
  importe: number;
}
