import { Module } from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { MovimientoController } from './movimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from './entities/movimiento.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, CuentaCorriente])],
  controllers: [MovimientoController],
  providers: [MovimientoService],
})
export class MovimientoModule {}
