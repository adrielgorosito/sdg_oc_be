import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { CreateObraSocialDTO } from 'src/obra-social/dto/create-obra-social.dto';

export class UpdateClienteObraSocialDTO extends PartialType(
  CreateObraSocialDTO,
) {
  @IsNumber()
  nroSocio: number;
}
