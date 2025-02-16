import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { UpdateClienteDTO } from 'src/cliente/dto/update-cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateCuentaCorrienteDTO extends BaseDTO {
  @IsNotEmpty()
  @IsNumber()
  saldo: number;

  @IsNotEmpty()
  @IsObject()
  @Type(() => UpdateClienteDTO)
  cliente: UpdateClienteDTO;
}
