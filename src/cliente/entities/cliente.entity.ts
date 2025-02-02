import { BaseEntity } from 'src/common/entities/base.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Localidad } from 'src/localidad/localidad.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Venta } from 'src/venta/entities/venta.entity';

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

  @Column()
  domicilio: string;

  @ManyToOne(() => Localidad, (localidad) => localidad.clientes)
  localidad: Localidad;

  @OneToMany(
    () => ClienteObraSocial,
    (clienteObraSocial) => clienteObraSocial.cliente,
  )
  clienteObraSocial: ClienteObraSocial[];

  @OneToOne(() => CuentaCorriente, (cuentaCorriente) => cuentaCorriente.cliente)
  cuentaCorriente: CuentaCorriente;

  @OneToMany(() => Venta, (ventas) => ventas.cliente)
  ventas: Venta[];
}
