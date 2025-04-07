import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraSocial } from '../obra-social/entities/obra-social.entity';
import { VentaObraSocial } from './entities/venta-obra-social.entity';
import { VentaObraSocialController } from './venta-obra-social.controller';
import { VentaObraSocialService } from './venta-obra-social.service';
@Module({
  imports: [TypeOrmModule.forFeature([VentaObraSocial, ObraSocial])],
  controllers: [VentaObraSocialController],
  providers: [VentaObraSocialService],
})
export class VentaObraSocialModule {}
