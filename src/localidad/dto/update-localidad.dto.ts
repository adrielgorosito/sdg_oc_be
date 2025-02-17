import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalidadDTO } from './create-localidad.dto';

export class UpdateLocalidadDTO extends PartialType(CreateLocalidadDTO) {}
