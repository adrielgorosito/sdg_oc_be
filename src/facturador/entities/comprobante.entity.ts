import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';
import { TipoDocumento } from '../enums/tipo-documento.enum';
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

  @Column({ enum: TipoDocumento })
  tipoDocumento: TipoDocumento;

  @Column({ type: 'bigint' })
  numeroDocumento: number;

  @OneToOne(() => Venta, { nullable: true })
  @JoinColumn()
  venta: Venta;

  @OneToOne(() => Comprobante, { nullable: true })
  @JoinColumn()
  facturaRelacionada: Comprobante;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  importeTotal: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  importeIva: number;

  @Column({ type: 'decimal', precision: 9, scale: 2, nullable: true })
  importeNeto: number;
}
