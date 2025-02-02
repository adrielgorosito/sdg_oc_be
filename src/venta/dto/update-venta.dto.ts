import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaDTO } from './create-venta.dto';

export class UpdateVentaDTO extends PartialType(CreateVentaDTO) {}
