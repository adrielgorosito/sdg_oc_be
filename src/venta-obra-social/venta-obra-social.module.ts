import { Module } from '@nestjs/common';
import { VentaObraSocialService } from './venta-obra-social.service';
import { VentaObraSocialController } from './venta-obra-social.controller';

@Module({
  controllers: [VentaObraSocialController],
  providers: [VentaObraSocialService],
})
export class VentaObraSocialModule {}
