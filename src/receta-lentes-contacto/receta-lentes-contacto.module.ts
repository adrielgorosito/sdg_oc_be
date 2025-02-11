import { Module } from '@nestjs/common';
import { RecetaLentesContactoService } from './receta-lentes-contacto.service';
import { RecetaLentesContactoController } from './receta-lentes-contacto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaLentesContacto } from './entities/receta-lentes-contacto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { PruebasLentesContacto } from 'src/pruebas-lentes-contacto/entities/pruebas-lentes-contacto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecetaLentesContacto,
      Cliente,
      PruebasLentesContacto,
    ]),
  ],
  controllers: [RecetaLentesContactoController],
  providers: [RecetaLentesContactoService],
})
export class RecetaLentesContactoModule {}
