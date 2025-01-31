import { Type } from 'class-transformer';
import { IsDecimal, IsObject } from 'class-validator';
import { ClienteDTO } from 'src/cliente/dto/cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CuentaCorrienteDTO extends BaseDTO {
  @IsDecimal()
  saldo: number;

  @IsObject()
  @Type(() => ClienteDTO)
  cliente: { id: number };
}
