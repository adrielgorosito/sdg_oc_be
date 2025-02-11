import { Module } from '@nestjs/common';
import { RecetaLentesContactoService } from './receta-lentes-contacto.service';
import { RecetaLentesContactoController } from './receta-lentes-contacto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaLentesContacto } from './entities/receta-lentes-contacto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecetaLentesContacto, Cliente])],
  controllers: [RecetaLentesContactoController],
  providers: [RecetaLentesContactoService],
})
export class RecetaLentesContactoModule {}
