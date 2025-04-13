import { Module } from '@nestjs/common';
import { AudiometriaService } from './audiometria.service';
import { AudiometriaController } from './audiometria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audiometria } from './entities/audiometria.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Audiometria, Cliente])],
  controllers: [AudiometriaController],
  providers: [AudiometriaService],
})
export class AudiometriaModule {}
