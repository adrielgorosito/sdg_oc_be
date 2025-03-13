import { Controller } from '@nestjs/common';
import { VentaObraSocialService } from './venta-obra-social.service';

@Controller('venta-obra-social')
export class VentaObraSocialController {
  constructor(private readonly ventaObraSocialService: VentaObraSocialService) {}
}
