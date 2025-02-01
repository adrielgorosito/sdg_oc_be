import { Module } from '@nestjs/common';
import { LineaVentaService } from './linea-venta.service';
import { LineaVentaController } from './linea-venta.controller';

@Module({
  controllers: [LineaVentaController],
  providers: [LineaVentaService],
})
export class LineaVentaModule {}
