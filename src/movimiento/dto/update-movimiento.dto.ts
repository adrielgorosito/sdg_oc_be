import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientoDTO } from './create-movimiento.dto';

export class UpdateMovimientoDTO extends PartialType(CreateMovimientoDTO) {}
