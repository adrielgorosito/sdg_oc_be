import { Controller, Get, Query } from '@nestjs/common';
import { VentaObraSocialService } from './venta-obra-social.service';

@Controller('os')
export class VentaObraSocialController {
  constructor(
    private readonly ventaObraSocialService: VentaObraSocialService,
  ) {}

  @Get('reporte')
  async getReporteOS(
    @Query('obraSocialId') obraSocialId: number,
    @Query('fechaDesde') fechaDesde: string,
    @Query('fechaHasta') fechaHasta: string,
  ) {
    return this.ventaObraSocialService.getReporteOS(
      obraSocialId,
      fechaDesde,
      fechaHasta,
    );
  }
}
