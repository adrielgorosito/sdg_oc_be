import { BaseTransactionalEntity } from 'src/common/entities/baseTransactional.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class LineaVenta extends BaseTransactionalEntity {
  @ManyToOne(() => Venta, (venta) => venta.lineasDeVenta, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  venta: Venta;

  @ManyToOne(() => Producto, (producto) => producto.lineasVentas)
  producto: Producto;

  @Column()
  cantidad: number;

  @Column('decimal', { precision: 9, scale: 2 })
  precioIndividual: number;
}
