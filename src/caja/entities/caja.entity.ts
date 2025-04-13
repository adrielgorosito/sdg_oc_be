import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  RedDePago,
  TipoMedioDePagoEnum,
} from './../../medio-de-pago/enum/medio-de-pago.enum';

@Entity()
export class Caja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime2', default: () => 'CURRENT_TIMESTAMP' })
  fechaMovimiento: Date;

  @Column({ nullable: true })
  detalle?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  importe: number;

  @Column()
  formaPago: TipoMedioDePagoEnum;

  @Column({ nullable: true })
  redDePago: RedDePago;
}
