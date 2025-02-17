import { BaseEntity } from 'src/common/entities/base.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { HistoriaClinicaLentesContacto } from 'src/historia-clinica-lentes-contacto/entities/historia-clinica-lentes-contacto.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';
import { Audiometria } from 'src/audiometria/entities/audiometria.entity';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';
import { Localidad } from 'src/localidad/entities/localidad.entity';

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

  @OneToMany(
    () => ClienteObraSocial,
    (clienteObrasSociales) => clienteObrasSociales.cliente,
  )
  clienteObrasSociales: ClienteObraSocial[];

  @OneToMany(() => Venta, (ventas) => ventas.cliente)
  ventas: Venta[];

  @OneToMany(
    () => RecetaLentesAereos,
    (recetasLentesAereos) => recetasLentesAereos.cliente,
  )
  recetasLentesAereos: RecetaLentesAereos;

  @OneToMany(
    () => RecetaLentesContacto,
    (recetasLentesContacto) => recetasLentesContacto.cliente,
  )
  recetasLentesContacto: RecetaLentesContacto;

  @OneToMany(() => Audiometria, (audiometrias) => audiometrias.cliente)
  audiometrias: Audiometria;

  @ManyToOne(() => Localidad, (localidad) => localidad.clientes)
  localidad: Localidad;

  @OneToOne(
    () => HistoriaClinicaLentesContacto,
    (historiaClinicaLentesContacto) => historiaClinicaLentesContacto.cliente,
  )
  historiaClinicaLentesContacto: HistoriaClinicaLentesContacto;

  @OneToOne(() => CuentaCorriente, (cuentaCorriente) => cuentaCorriente.cliente)
  cuentaCorriente: CuentaCorriente;
}
