import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { CreateClienteDTO } from 'src/cliente/dto/create-cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateCuentaCorrienteDTO extends BaseDTO {
  @IsNotEmpty()
  @IsNumber()
  saldo: number;

  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateClienteDTO)
  cliente: { id: number };
}
