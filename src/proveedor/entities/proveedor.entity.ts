import { BaseEntity } from 'src/common/entities/base.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Proveedor extends BaseEntity {
  @OneToMany(() => Producto, (producto) => producto.proveedor)
  productos: Producto[];

  @Column({ unique: true, type: 'bigint' })
  cuit: number;

  @Column()
  razonSocial: string;

  @Column()
  telefono: string;

  @Column()
  email: string;
}
