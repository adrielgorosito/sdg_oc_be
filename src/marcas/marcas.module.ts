import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { MarcasController } from './marcas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Marca } from './entities/marca.entity';

@Module({
  controllers: [MarcasController],
  providers: [MarcasService],
  imports: [TypeOrmModule.forFeature([Producto, Marca, Proveedor])],
})
export class MarcasModule {}
