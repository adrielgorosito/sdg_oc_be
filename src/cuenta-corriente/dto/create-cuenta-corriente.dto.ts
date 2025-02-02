import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import { ClienteDTO } from 'src/cliente/dto/cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateCuentaCorrienteDTO extends BaseDTO {
  @IsNumber()
  saldo: number;

  @IsObject()
  @Type(() => ClienteDTO)
  cliente: { id: number };
}
