import { PartialType } from '@nestjs/mapped-types';
import { CreateProvinciaDto } from './create-provincia.dto';

export class UpdateProvinciaDto extends PartialType(CreateProvinciaDto) {}
