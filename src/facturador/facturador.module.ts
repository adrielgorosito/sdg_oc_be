import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parametro } from 'src/parametros/entities/parametro.entity';
import { ComprobanteController } from './comprobante.controller';
import { Comprobante } from './entities/comprobante.entity';
import { Token } from './entities/token.entity';
import { AfipService } from './services/afip.service';
import { FacturadorService } from './services/facturador.service';
@Module({
  controllers: [ComprobanteController],
  providers: [AfipService, FacturadorService],
  imports: [TypeOrmModule.forFeature([Comprobante, Token, Parametro])],
  exports: [AfipService, FacturadorService],
})
export class FacturadorModule {}
