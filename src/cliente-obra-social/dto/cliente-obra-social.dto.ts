import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import { ClienteDTO } from 'src/cliente/dto/cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { ObraSocialDTO } from 'src/obra-social/dto/obra-social.dto';

export class ClienteObraSocialDTO extends BaseDTO {
  @IsNumber()
  nroSocio: number;

  @IsObject()
  @Type(() => ClienteDTO)
  cliente: { id: number };

  @IsObject()
  @Type(() => ObraSocialDTO)
  obraSocial: { id: number };
}
