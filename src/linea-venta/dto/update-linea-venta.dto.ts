import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaVentaDTO } from './create-linea-venta.dto';

export class UpdateLineaVentaDTO extends PartialType(CreateLineaVentaDTO) {}
