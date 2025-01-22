import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Marca, Proveedor])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
