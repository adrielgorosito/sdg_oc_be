import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ClienteDTO } from 'src/cliente/dto/cliente.dto';
import { BaseTransactionalDTO } from 'src/common/dtos/baseTransactional.dto';

export class CreateVentaDTO extends BaseTransactionalDTO {
  @IsNotEmpty()
  @IsDate()
  fecha: Date;

  @IsNotEmpty()
  @IsNumber()
  numeroFactura: number;

  @IsNotEmpty()
  @IsNumber()
  descuentoPorcentaje: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ClienteDTO)
  cliente: ClienteDTO;
}
