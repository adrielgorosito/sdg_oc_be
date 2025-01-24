import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

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
}
