import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { CreateClienteDTO } from 'src/cliente/dto/create-cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { CreateObraSocialDTO } from 'src/obra-social/dto/create-obra-social.dto';

export class CreateClienteObraSocialDTO extends BaseDTO {
  @IsNotEmpty()
  @IsNumber()
  nroSocio: number;

  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateClienteDTO)
  cliente: { id: number };

  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateObraSocialDTO)
  obraSocial: { id: number };
}
