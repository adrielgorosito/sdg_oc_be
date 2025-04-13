import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { CondicionIva } from 'src/comprobante/enums/condicion-iva.enum';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class VentaObraSocial extends BaseTransactionalEntity {
  @ManyToOne(() => Venta, (venta) => venta.ventaObraSocial)
  venta: Venta;

  @ManyToOne(() => ObraSocial, (obraSocial) => obraSocial.ventasObraSocial)
  obraSocial: ObraSocial;

  @Column('decimal', { precision: 9, scale: 2 })
  importe: number;

  @Column()
  condicionIva: CondicionIva;
}
