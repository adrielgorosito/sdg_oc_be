import { BaseEntity } from 'src/common/entities/base.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Cliente extends BaseEntity {
  @Column()
  dni: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  telefono: string;

  @Column()
  domicilio: string;

  @Column()
  sexo: string;

  fechaNac: Date;

  fechaAlta: Date;

  @Column()
  observaciones: string;

  @OneToMany(
    () => ClienteObraSocial,
    (clienteObraSocial) => clienteObraSocial.cliente,
  )
  clienteObraSocial: ClienteObraSocial[];
}
