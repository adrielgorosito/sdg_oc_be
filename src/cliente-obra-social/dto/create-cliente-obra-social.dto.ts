import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import { ClienteDTO } from 'src/cliente/dto/cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { CreateObraSocialDTO } from 'src/obra-social/dto/create-obra-social.dto';

export class CreateClienteObraSocialDTO extends BaseDTO {
  @IsNumber()
  nroSocio: number;

  @IsObject()
  @Type(() => ClienteDTO)
  cliente: { id: number };

  @IsObject()
  @Type(() => CreateObraSocialDTO)
  obraSocial: { id: number };
}
