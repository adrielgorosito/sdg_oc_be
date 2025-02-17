import { Audiometria } from 'src/audiometria/entities/audiometria.entity';
import { ClienteObraSocial } from 'src/cliente-obra-social/entities/cliente-obra-social.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { HistoriaClinicaLentesContacto } from 'src/historia-clinica-lentes-contacto/entities/historia-clinica-lentes-contacto.entity';
import { Localidad } from 'src/localidad/entities/localidad.entity';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class Cliente extends BaseEntity {
  @Column({ unique: true })
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

  @Column({ type: 'datetime2' })
  fechaNac: Date;

  @Column({ nullable: true })
  observaciones: string;

  @Column()
  domicilio: string;

  @ManyToOne(() => Localidad, (localidad) => localidad.clientes)
  localidad: Localidad;

  @OneToMany(
    () => ClienteObraSocial,
    (clienteObrasSociales) => clienteObrasSociales.cliente,
    {
      cascade: true,
    },
  )
  clienteObrasSociales: ClienteObraSocial[];

  @OneToMany(() => Venta, (ventas) => ventas.cliente)
  ventas: Venta[];

  @OneToMany(
    () => RecetaLentesAereos,
    (recetasLentesAereos) => recetasLentesAereos.cliente,
  )
  recetasLentesAereos: RecetaLentesAereos[];

  @OneToMany(
    () => RecetaLentesContacto,
    (recetasLentesContacto) => recetasLentesContacto.cliente,
  )
  recetasLentesContacto: RecetaLentesContacto[];

  @OneToMany(() => Audiometria, (audiometrias) => audiometrias.cliente)
  audiometrias: Audiometria[];

  @OneToOne(
    () => HistoriaClinicaLentesContacto,
    (historiaClinicaLentesContacto) => historiaClinicaLentesContacto.cliente,
  )
  historiaClinicaLentesContacto: HistoriaClinicaLentesContacto;

  @OneToOne(
    () => CuentaCorriente,
    (cuentaCorriente) => cuentaCorriente.cliente,
    { cascade: true },
  )
  cuentaCorriente: CuentaCorriente;
}
