import { BaseEntity } from 'src/common/entities/base.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
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
}
