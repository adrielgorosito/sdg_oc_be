import { Module } from '@nestjs/common';
import { RecetaLentesAereosService } from './receta-lentes-aereos.service';
import { RecetaLentesAereosController } from './receta-lentes-aereos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaLentesAereos } from './entities/receta-lentes-aereos.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecetaLentesAereos, Cliente])],
  controllers: [RecetaLentesAereosController],
  providers: [RecetaLentesAereosService],
})
export class RecetaLentesAereosModule {}
