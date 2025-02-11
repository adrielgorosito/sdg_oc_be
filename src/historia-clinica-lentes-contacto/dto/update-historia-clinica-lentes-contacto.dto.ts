import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoriaClinicaLentesContactoDTO } from './create-historia-clinica-lentes-contacto.dto';

export class UpdateHistoriaClinicaLentesContactoDTO extends PartialType(
  CreateHistoriaClinicaLentesContactoDTO,
) {}
