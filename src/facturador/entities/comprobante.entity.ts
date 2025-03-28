import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';
@Entity()
export class Comprobante extends BaseTransactionalEntity {
  @Column()
  numeroComprobante: string;

  @Column({ type: 'bigint' })
  CAE: number;

  @Column({ type: 'datetime2' })
  fechaEmision: Date;

  @Column({ enum: TipoComprobante })
  tipoComprobante: TipoComprobante;

  @OneToOne(() => Venta, { nullable: true })
  @JoinColumn()
  venta: Venta;

  @OneToMany(() => Comprobante, (comprobante) => comprobante.facturaRelacionada)
  facturasRelacionadas?: Comprobante[];

  @ManyToOne(
    () => Comprobante,
    (comprobante) => comprobante.facturasRelacionadas,
    { nullable: true },
  )
  @JoinColumn()
  facturaRelacionada?: Comprobante;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  importeTotal: number;
}
