import { PartialType } from '@nestjs/mapped-types';
import { CreateMedioDePagoDto } from './create-medio-de-pago.dto';

export class UpdateMedioDePagoDto extends PartialType(CreateMedioDePagoDto) {}
