import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parametro } from 'src/parametros/entities/parametro.entity';
import { ComprobanteController } from './comprobante.controller';
import { Comprobante } from './entities/comprobante.entity';
import { Token } from './entities/token.entity';
import { AfipService } from './services/afip.service';
import { ComprobanteService } from './services/comprobante.service';
import { GeneradorDocumentosService } from './services/generador-documentos.service';
@Module({
  controllers: [ComprobanteController],
  providers: [AfipService, ComprobanteService, GeneradorDocumentosService],
  imports: [TypeOrmModule.forFeature([Comprobante, Token, Parametro])],
  exports: [AfipService, ComprobanteService],
})
export class ComprobanteModule {}
