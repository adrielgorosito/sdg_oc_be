import { Module } from '@nestjs/common';
import { MedioDePagoService } from './medio-de-pago.service';
import { MedioDePagoController } from './medio-de-pago.controller';

@Module({
  controllers: [MedioDePagoController],
  providers: [MedioDePagoService],
})
export class MedioDePagoModule {}
