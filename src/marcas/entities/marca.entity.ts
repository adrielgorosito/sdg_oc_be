import { Producto } from 'src/productos/entities/producto.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Marca {
  @Column({ unique: true, primary: true })
  id: string;

  @OneToMany(() => Producto, (producto) => producto.marca)
  productos: Producto[];

  @Column()
  descripcion: string;
}
