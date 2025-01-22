import { Marca } from 'src/marcas/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Producto {
  @Column({ unique: true, primary: true })
  id: string;

  @ManyToOne(() => Marca, (marca) => marca.productos, { onDelete: 'CASCADE' })
  marca: Marca;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.productos, {
    onDelete: 'CASCADE',
  })
  proveedor: Proveedor;

  @Column()
  descripcion: string;
}
