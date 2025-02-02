import { PartialType } from '@nestjs/mapped-types';
import { CreateCuentaCorrienteDTO } from './create-cuenta-corriente.dto';

export class UpdateCuentaCorrienteDTO extends PartialType(
  CreateCuentaCorrienteDTO,
) {}
