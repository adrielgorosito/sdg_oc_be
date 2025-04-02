import { PartialType } from '@nestjs/mapped-types';
import { CreateCajaDTO } from './create-caja.dto';

export class UpdateCajaDto extends PartialType(CreateCajaDTO) {}
