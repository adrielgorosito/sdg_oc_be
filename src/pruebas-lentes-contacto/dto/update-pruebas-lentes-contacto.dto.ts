import { PartialType } from '@nestjs/mapped-types';
import { CreatePruebasLentesContactoDTO } from './create-pruebas-lentes-contacto.dto';

export class UpdatePruebasLentesContactoDTO extends PartialType(
  CreatePruebasLentesContactoDTO,
) {}
