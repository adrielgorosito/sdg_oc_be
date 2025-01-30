import { BaseEntity } from 'src/common/entities/base.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Proveedor extends BaseEntity {
  @OneToMany(() => Producto, (producto) => producto.proveedor)
  productos: Producto[];

  @Column()
  cuit: string;

  @Column()
  razonSocial: string;

  @Column()
  telefono: string;

  @Column()
  email: string;
}
