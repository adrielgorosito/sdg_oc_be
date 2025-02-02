import { BaseEntity } from 'src/common/entities/base.entity';
import { LineaVenta } from 'src/linea-venta/entities/linea-venta.entity';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
@Entity()
export class Producto extends BaseEntity {
  @Column()
  descripcion: string;

  @Column('decimal', { precision: 9, scale: 2 })
  precio: number;

  @ManyToOne(() => Marca, (marca) => marca.productos, { onDelete: 'CASCADE' })
  marca: Marca;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    onDelete: 'CASCADE',
  })
  proveedor: Proveedor;

  @OneToMany(() => LineaVenta, (lineaVenta) => lineaVenta.producto)
  lineasVentas: LineaVenta[];
}
