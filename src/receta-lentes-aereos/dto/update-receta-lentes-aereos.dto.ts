import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaLentesAereosDTO } from './create-receta-lentes-aereos.dto';

export class UpdateRecetaLentesAereosDTO extends PartialType(
  CreateRecetaLentesAereosDTO,
) {}
