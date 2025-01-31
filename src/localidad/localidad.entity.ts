import { Entity, Column, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Provincia } from 'src/provincia/provincia.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Entity()
export class Localidad {
  @PrimaryColumn()
  id: number;

  @Column()
  localidad: string;

  @ManyToOne(() => Provincia, (provincia) => provincia.localidades)
  provincia: Provincia;

  @OneToMany(() => Cliente, (cliente) => cliente.localidad)
  clientes: Cliente[];
}
