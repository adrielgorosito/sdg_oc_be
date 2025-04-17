import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CajaModule } from 'src/caja/caja.module';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ComprobanteModule } from 'src/comprobante/comprobante.module';
import { Comprobante } from 'src/comprobante/entities/comprobante.entity';
import { Token } from 'src/comprobante/entities/token.entity';
import { CuentaCorrienteModule } from 'src/cuenta-corriente/cuenta-corriente.module';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Marca } from 'src/marca/entities/marca.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { Parametro } from 'src/parametros/entities/parametro.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { ProductoModule } from 'src/producto/producto.module';
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
      CuentaCorriente,
      Movimiento,
      Comprobante,
      Parametro,
    ]),
    ProductoModule,
    ComprobanteModule,
    CuentaCorrienteModule,
    CajaModule,
  ],
  controllers: [VentaController],
  providers: [VentaService],
})
export class VentaModule {}
