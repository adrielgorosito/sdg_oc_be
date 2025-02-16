import { Module } from '@nestjs/common';
import { DetallesRecetaLentesAereosService } from './detalles-receta-lentes-aereos.service';
import { DetallesRecetaLentesAereosController } from './detalles-receta-lentes-aereos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesRecetaLentesAereos } from './entities/detalles-receta-lentes-aereos.entity';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallesRecetaLentesAereos, RecetaLentesAereos]),
  ],
  controllers: [DetallesRecetaLentesAereosController],
  providers: [DetallesRecetaLentesAereosService],
})
export class DetallesRecetaLentesAereosModule {}
