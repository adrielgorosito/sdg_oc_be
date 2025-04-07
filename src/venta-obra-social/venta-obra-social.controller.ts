import { Controller, Get } from '@nestjs/common';
import { VentaObraSocialService } from './venta-obra-social.service';

@Controller('os')
export class VentaObraSocialController {
  constructor(
    private readonly ventaObraSocialService: VentaObraSocialService,
  ) {}

  @Get('reporte')
  async getReporteOS() {
    return this.ventaObraSocialService.getReporteOS();
  }
}
