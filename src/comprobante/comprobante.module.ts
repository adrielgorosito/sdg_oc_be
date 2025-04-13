import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteModule } from 'src/cliente/cliente.module';
import { Parametro } from 'src/parametros/entities/parametro.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { ComprobanteController } from './comprobante.controller';
import { Comprobante } from './entities/comprobante.entity';
import { Token } from './entities/token.entity';
import { AfipService } from './services/afip.service';
import { ComprobanteService } from './services/comprobante.service';
import { EmailService } from './services/email.service';
import { GeneradorDocumentosService } from './services/generador-documentos.service';
@Module({
  controllers: [ComprobanteController],
  providers: [
    AfipService,
    ComprobanteService,
    GeneradorDocumentosService,
    EmailService,
  ],
  imports: [
    TypeOrmModule.forFeature([Comprobante, Token, Parametro, Venta]),
    ClienteModule,
  ],
  exports: [AfipService, ComprobanteService, EmailService],
})
export class ComprobanteModule {}
