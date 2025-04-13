import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from 'src/venta/entities/venta.entity';
import { CajaController } from './caja.controller';
import { CajaService } from './caja.service';
import { Caja } from './entities/caja.entity';

@Module({
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService],
  imports: [TypeOrmModule.forFeature([Caja, Venta])],
})
export class CajaModule {}
