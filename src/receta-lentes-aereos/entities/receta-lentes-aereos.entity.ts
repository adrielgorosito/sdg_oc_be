import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { DetallesRecetaLentesAereos } from 'src/detalles-receta-lentes-aereos/entities/detalles-receta-lentes-aereos.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

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

  @ManyToOne(() => Cliente, (cliente) => cliente.recetasLentesAereos)
  cliente: Cliente;

  @OneToMany(
    () => DetallesRecetaLentesAereos,
    (detallesRecetaLentesAereos) =>
      detallesRecetaLentesAereos.recetaLentesAereos,
    { cascade: true },
  )
  detallesRecetaLentesAereos: DetallesRecetaLentesAereos[];
}
