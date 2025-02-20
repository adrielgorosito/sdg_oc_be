import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { LineaFactura } from './lineaFactura.entity';

@Entity()
export class Factura extends BaseTransactionalEntity {
  @Column()
  numeroFactura: string;

  @Column()
  CAE: string;

  @Column()
  fechaEmsion: Date;

  @Column()
  total: number;

  @Column()
  estado: string;

  @ManyToOne(() => Cliente)
  cliente: Cliente;

  @OneToMany(() => LineaFactura, (lineaFactura) => lineaFactura.factura, {
    cascade: true,
  })
  lineasFactura: LineaFactura[];
}
