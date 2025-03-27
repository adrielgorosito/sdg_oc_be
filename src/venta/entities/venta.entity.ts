import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Comprobante } from 'src/facturador/entities/comprobante.entity';
import { LineaVenta } from 'src/linea-venta/entities/linea-venta.entity';
import { MedioDePago } from 'src/medio-de-pago/entities/medio-de-pago.entity';
import { VentaObraSocial } from 'src/venta-obra-social/entities/venta-obra-social.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class Venta extends BaseTransactionalEntity {
  @Column()
  fecha: Date;

  @Column({ nullable: true })
  descuentoPorcentaje: number;

  @Column()
  importe: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas)
  cliente: Cliente;

  @OneToMany(() => LineaVenta, (lineaVenta) => lineaVenta.venta, {
    cascade: true,
  })
  lineasDeVenta: LineaVenta[];

  @OneToMany(() => MedioDePago, (medioDePago) => medioDePago.venta, {
    cascade: true,
  })
  mediosDePago: MedioDePago[];

  @OneToOne(() => Comprobante, (comprobante) => comprobante.venta, {
    nullable: true,
  })
  comprobante: Comprobante;

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @OneToMany(
    () => VentaObraSocial,
    (ventaObraSocial) => ventaObraSocial.venta,
    {
      cascade: true,
    },
  )
  ventaObraSocial: VentaObraSocial[];

  @BeforeInsert()
  asignarNumerosPago() {
    if (this.mediosDePago && this.mediosDePago.length > 0) {
      this.mediosDePago.forEach((medioPago, index) => {
        medioPago.numeroPago = index + 1;
      });
    }
  }
}
