import { BaseEntity } from 'src/common/entities/base.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Localidad } from 'src/localidad/localidad.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { HistoriaClinicaLentesContacto } from 'src/historia-clinica-lentes-contacto/entities/historia-clinica-lentes-contacto.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';
import { Audiometria } from 'src/audiometria/entities/audiometria.entity';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';

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

  @Column({ nullable: true })
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

  @OneToOne(
    () => HistoriaClinicaLentesContacto,
    (historiaClinicaLentesContacto) => historiaClinicaLentesContacto.cliente,
  )
  historiaClinicaLentesContacto: HistoriaClinicaLentesContacto;

  @OneToMany(
    () => RecetaLentesContacto,
    (recetasLentesContacto) => recetasLentesContacto.cliente,
  )
  recetasLentesContacto: RecetaLentesContacto[];

  @OneToMany(() => Audiometria, (audiometrias) => audiometrias.cliente)
  audiometrias: Audiometria[];

  @OneToMany(
    () => RecetaLentesAereos,
    (recetaLentesAereos) => recetaLentesAereos.cliente,
  )
  recetaLentesAereos: RecetaLentesAereos[];
}
