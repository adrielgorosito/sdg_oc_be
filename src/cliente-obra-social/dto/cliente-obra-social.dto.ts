import { Type } from 'class-transformer';
import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { ClienteDTO } from 'src/cliente/dto/cliente.dto';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { ObraSocialDTO } from 'src/obra-social/dto/obra-social.dto';

export class ClienteObraSocialDTO extends BaseDTO {
  @IsNumber()
  nroSocio: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ClienteDTO)
  cliente: ClienteDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => ObraSocialDTO)
  obraSocial: ObraSocialDTO;
}
