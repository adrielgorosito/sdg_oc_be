import { Module } from '@nestjs/common';
import { HistoriaClinicaLentesContactoService } from './historia-clinica-lentes-contacto.service';
import { HistoriaClinicaLentesContactoController } from './historia-clinica-lentes-contacto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaClinicaLentesContacto } from './entities/historia-clinica-lentes-contacto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriaClinicaLentesContacto, Cliente])],
  controllers: [HistoriaClinicaLentesContactoController],
  providers: [HistoriaClinicaLentesContactoService],
})
export class HistoriaClinicaLentesContactoModule {}
