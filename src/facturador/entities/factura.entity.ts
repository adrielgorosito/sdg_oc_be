import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';
import { TipoDocumento } from '../enums/tipo-documento.enum';
@Entity()
export class Factura extends BaseTransactionalEntity {
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

  @OneToOne(() => Factura, { nullable: true })
  @JoinColumn()
  facturaRelacionada: Factura;
}
