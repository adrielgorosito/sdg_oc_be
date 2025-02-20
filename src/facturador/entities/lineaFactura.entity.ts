import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Factura } from './factura.entity';

@Entity()
export class LineaFactura extends BaseTransactionalEntity {
  @Column()
  cantidad: number;

  @Column()
  precio: number;

  @Column()
  subtotal: number;

  @ManyToOne(() => Factura, (factura) => factura.lineasFactura)
  factura: Factura;
}
