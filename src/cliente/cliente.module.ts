import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { Cliente } from './entities/cliente.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, ClienteObraSocial, ObraSocial])],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}
