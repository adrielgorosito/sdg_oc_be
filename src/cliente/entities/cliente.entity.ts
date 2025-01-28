import { BaseEntity } from 'src/common/entities/base.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Localidad } from 'src/localidad/localidad.entity';

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
  sexo: string;

  @Column()
  fechaNac: Date;

  @Column()
  observaciones: string;

  @Column() // Ahora "domicilio" es un string con calle y número
  domicilio: string;

  @ManyToOne(() => Localidad, (localidad) => localidad.clientes)
  @JoinColumn({ name: 'localidad_id' }) // Crea la FK "localidad_id" en Cliente
  localidad: Localidad;

  @OneToMany(
    () => ClienteObraSocial,
    (clienteObraSocial) => clienteObraSocial.cliente,
  )
  clienteObraSocial: ClienteObraSocial[];
}
