import { Localidad } from 'src/localidad/entities/localidad.entity';
import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Provincia {
  @PrimaryColumn()
  id: number;

  @Column()
  provincia: string;

  @OneToMany(() => Localidad, (localidad) => localidad.provincia)
  localidades: Localidad[];
}
