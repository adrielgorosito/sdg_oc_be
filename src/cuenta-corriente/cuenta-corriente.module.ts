import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaModule } from 'src/caja/caja.module';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { CuentaCorrienteController } from './cuenta-corriente.controller';
import { CuentaCorrienteService } from './cuenta-corriente.service';
import { CuentaCorriente } from './entities/cuenta-corriente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CuentaCorriente, Movimiento, Cliente]),
    CajaModule,
  ],
  controllers: [CuentaCorrienteController],
  providers: [CuentaCorrienteService],
  exports: [CuentaCorrienteService],
})
export class CuentaCorrienteModule {}
