import { BaseEntity } from 'src/common/entities/base.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Marca extends BaseEntity {
  @OneToMany(() => Producto, (producto) => producto.marca)
  productos: Producto[];

  @Column()
  descripcion: string;
}
