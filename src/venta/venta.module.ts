import { Module } from '@nestjs/common';
import { VentasService } from './venta.service';
import { VentasController } from './venta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Cliente])],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
