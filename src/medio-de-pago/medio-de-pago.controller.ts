import { Controller } from '@nestjs/common';
import { MedioDePagoService } from './medio-de-pago.service';

@Controller('medio-de-pago')
export class MedioDePagoController {
  constructor(private readonly medioDePagoService: MedioDePagoService) {}
}
