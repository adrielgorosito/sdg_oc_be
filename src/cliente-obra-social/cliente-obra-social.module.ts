import { Module } from '@nestjs/common';
import { ClienteObraSocialService } from './cliente-obra-social.service';
import { ClienteObraSocialController } from './cliente-obra-social.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteObraSocial } from './entities/cliente-obra-social.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteObraSocial, Cliente, ObraSocial])],
  controllers: [ClienteObraSocialController],
  providers: [ClienteObraSocialService],
})
export class ClienteObraSocialModule {}
