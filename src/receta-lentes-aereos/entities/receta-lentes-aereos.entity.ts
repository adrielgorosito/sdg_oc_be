import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class RecetaLentesAereos extends BaseEntity {
  @Column()
  fecha: Date;

  @Column()
  tipoReceta: string;

  @Column()
  oftalmologo: string;

  @Column()
  cristal: string;

  @Column()
  color: string;

  @Column()
  armazon: string;

  @Column()
  tratamiento: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.recetaLentesAereos)
  cliente: Cliente;

  // , {cascade: true}
}
