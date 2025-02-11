import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaLentesContactoDTO } from './create-receta-lentes-contacto.dto';

export class UpdateRecetaLentesContactoDTO extends PartialType(
  CreateRecetaLentesContactoDTO,
) {}
