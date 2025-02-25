import { BaseEntity } from 'src/common/entities/base.entity';
import { LineaVenta } from 'src/linea-venta/entities/linea-venta.entity';
import { Marca } from 'src/marca/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CategoriaEnum } from '../enums/categoria.enum';

@Entity()
export class Producto extends BaseEntity {
  @Column()
  descripcion: string;

  @Column('decimal', { precision: 9, scale: 2 })
  precio: number;

  @Column('decimal', { precision: 9, scale: 2 })
  precioSugerido: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ enum: CategoriaEnum })
  categoria: CategoriaEnum;

  @ManyToOne(() => Marca, (marca) => marca.productos, { onDelete: 'CASCADE' })
  marca: Marca;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    onDelete: 'CASCADE',
  })
  proveedor: Proveedor;

  @OneToMany(() => LineaVenta, (lineaVenta) => lineaVenta.producto)
  lineasVentas: LineaVenta[];
}
