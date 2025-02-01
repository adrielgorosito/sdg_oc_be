import { PartialType } from '@nestjs/mapped-types';
import { CreateObraSocialDTO } from 'src/obra-social/dto/create-obra-social.dto';

export class UpdateClienteObraSocialDTO extends PartialType(
  CreateObraSocialDTO,
) {}
