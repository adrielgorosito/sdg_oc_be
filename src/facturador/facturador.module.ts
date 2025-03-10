import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Token } from './entities/token.entity';
import { FacturadorController } from './facturador.controller';
import { AfipService } from './services/afip.service';
import { FacturadorService } from './services/facturador.service';
@Module({
  controllers: [FacturadorController],
  providers: [AfipService, FacturadorService],
  imports: [TypeOrmModule.forFeature([Factura, Token])],
})
export class FacturadorModule {}
