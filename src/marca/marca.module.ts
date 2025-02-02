import { Module } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { MarcaController } from './marca.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from 'src/producto/entities/producto.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Marca } from './entities/marca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Marca, Proveedor])],
  controllers: [MarcaController],
  providers: [MarcaService],
})
export class MarcaModule {}
