import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';

@Module({
  controllers: [MarcasController],
  providers: [MarcasService],
})
export class MarcasModule {}
