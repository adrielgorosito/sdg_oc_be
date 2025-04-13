import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { RedDePago, TipoMedioDePagoEnum } from '../enum/medio-de-pago.enum';
@Entity()
export class MedioDePago {
  @PrimaryColumn()
  numeroPago: number;

  @PrimaryColumn()
  ventaId: string;

  @Column({ enum: TipoMedioDePagoEnum })
  tipoMedioDePago: TipoMedioDePagoEnum;

  @Column({ nullable: true })
  entidadBancaria: string;

  @Column({ enum: RedDePago, nullable: true })
  redDePago: RedDePago;

  @Column({ type: 'decimal', precision: 9, scale: 2 })
  importe: number;

  @ManyToOne(() => Venta, (venta) => venta.mediosDePago, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  venta: Venta;
}
