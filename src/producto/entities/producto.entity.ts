import { BaseEntity } from 'src/common/entities/base.entity';
import { LineaVenta } from 'src/linea-venta/entities/linea-venta.entity';
import { Marca } from 'src/marca/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CategoriaEnum } from '../enums/categoria.enum';

@Entity()
export class Producto extends BaseEntity {
  @Column()
  codProv: string;

  @Column()
  descripcion: string;

  @Column({ enum: CategoriaEnum })
  categoria: CategoriaEnum;

  @Column('decimal', { precision: 9, scale: 2 })
  precioLista: number;

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
