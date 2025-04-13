import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallesRecetaLentesAereosDTO } from './create-detalles-receta-lentes-aereos.dto';

export class UpdateDetallesRecetaLentesAereosDTO extends PartialType(
  CreateDetallesRecetaLentesAereosDTO,
) {}
