import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { LineaVenta } from 'src/linea-venta/entities/linea-venta.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Venta extends BaseTransactionalEntity {
  @Column()
  fecha: Date;

  @Column()
  numeroFactura: number;

  @Column()
  descuentoPorcentaje: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas)
  cliente: Cliente;

  @OneToMany(() => LineaVenta, (lineaVenta) => lineaVenta.venta)
  lineasDeVenta: LineaVenta[];
}
