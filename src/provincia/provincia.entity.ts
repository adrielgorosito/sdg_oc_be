import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Localidad } from 'src/localidad/localidad.entity';

@Entity()
export class Provincia {
  @PrimaryColumn()
  id: number;

  @Column()
  provincia: string;

  @OneToMany(() => Localidad, (localidad) => localidad.provincia)
  localidades: Localidad[];
}
