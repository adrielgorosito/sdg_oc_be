import { BaseEntity } from 'src/common/entities/base.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Entity, OneToMany } from 'typeorm';

@Entity()
export class Proveedor extends BaseEntity {
  @OneToMany(() => Producto, (producto) => producto.proveedor)
  productos: Producto[];
}
