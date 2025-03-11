import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Factura } from 'src/facturador/entities/factura.entity';
import { Token } from 'src/facturador/entities/token.entity';
import { FacturadorModule } from 'src/facturador/facturador.module';
import { AfipService } from 'src/facturador/services/afip.service';
import { FacturadorService } from 'src/facturador/services/facturador.service';
import { Marca } from 'src/marca/entities/marca.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { ProductoModule } from 'src/producto/producto.module';
import { ProductoService } from 'src/producto/producto.service';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Venta } from './entities/venta.entity';
import { VentaController } from './venta.controller';
import { VentaService } from './venta.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      Cliente,
      Producto,
      Marca,
      Proveedor,
      Token,
      Factura,
    ]),
    ProductoModule,
    FacturadorModule,
  ],
  controllers: [VentaController],
  providers: [VentaService, ProductoService, FacturadorService, AfipService],
})
export class VentaModule {}
