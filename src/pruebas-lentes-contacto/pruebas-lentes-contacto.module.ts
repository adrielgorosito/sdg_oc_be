import { Module } from '@nestjs/common';
import { PruebasLentesContactoService } from './pruebas-lentes-contacto.service';
import { PruebasLentesContactoController } from './pruebas-lentes-contacto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PruebasLentesContacto } from './entities/pruebas-lentes-contacto.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PruebasLentesContacto, RecetaLentesContacto]),
  ],
  controllers: [PruebasLentesContactoController],
  providers: [PruebasLentesContactoService],
})
export class PruebasLentesContactoModule {}
