import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Movimiento } from './entities/movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, CuentaCorriente])],
})
export class MovimientoModule {}
