import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Marca } from 'src/marca/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { ExcelService } from './utils/excel.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Marca, Proveedor])],
  controllers: [ProductoController],
  providers: [ProductoService, ExcelService],
})
export class ProductoModule {}
