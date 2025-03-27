import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Comprobante } from 'src/facturador/entities/comprobante.entity';
import { Token } from 'src/facturador/entities/token.entity';
import { FacturadorModule } from 'src/facturador/facturador.module';
import { Marca } from 'src/marca/entities/marca.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { Parametro } from 'src/parametros/entities/parametro.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { ProductoModule } from 'src/producto/producto.module';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Venta } from './entities/venta.entity';
import { VentaController } from './venta.controller';
import { VentaService } from './venta.service';
import { CuentaCorrienteModule } from 'src/cuenta-corriente/cuenta-corriente.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta,
      Cliente,
      Producto,
      Marca,
      Proveedor,
      Token,
      CuentaCorriente,
      Movimiento,
      Comprobante,
      Parametro,
    ]),
    ProductoModule,
    FacturadorModule,
    CuentaCorrienteModule,
  ],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}
