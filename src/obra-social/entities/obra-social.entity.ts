import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { VentaObraSocial } from 'src/venta-obra-social/entities/venta-obra-social.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class ObraSocial extends BaseEntity {
  @Column()
  nombre: string;

  @OneToMany(
    () => ClienteObraSocial,
    (clienteObraSocial) => clienteObraSocial.obraSocial,
  )
  clienteObraSocial: ClienteObraSocial[];

  @OneToMany(
    () => VentaObraSocial,
    (ventaObraSocial) => ventaObraSocial.obraSocial,
  )
  ventasObraSocial: VentaObraSocial[];
}
