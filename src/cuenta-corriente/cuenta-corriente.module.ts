import { Module } from '@nestjs/common';
import { CuentaCorrienteService } from './cuenta-corriente.service';
import { CuentaCorrienteController } from './cuenta-corriente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { CuentaCorriente } from './entities/cuenta-corriente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CuentaCorriente, Movimiento, Cliente])],
  controllers: [CuentaCorrienteController],
  providers: [CuentaCorrienteService],
})
export class CuentaCorrienteModule {}
