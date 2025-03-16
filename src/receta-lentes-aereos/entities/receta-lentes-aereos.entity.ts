import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { DetallesRecetaLentesAereos } from 'src/detalles-receta-lentes-aereos/entities/detalles-receta-lentes-aereos.entity';
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TipoReceta } from '../../common/enums/tipo-receta.enum';

@Entity()
export class RecetaLentesAereos extends BaseEntity {
  @Column()
  fecha: Date;

  @Column({ enum: TipoReceta })
  tipoReceta: TipoReceta;

  @Column()
  oftalmologo: string;

  @Column()
  cristal: string;

  @Column()
  color: string;

  @Column({ nullable: true })
  armazon: string;

  @Column()
  tratamiento: string;

  @Column({ nullable: true })
  observaciones: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.recetasLentesAereos)
  cliente: Cliente;

  @OneToMany(
    () => DetallesRecetaLentesAereos,
    (detallesRecetaLentesAereos) =>
      detallesRecetaLentesAereos.recetaLentesAereos,
    { cascade: true },
  )
  detallesRecetaLentesAereos: DetallesRecetaLentesAereos[];

  @BeforeInsert()
  asignarNumeroDetalle() {
    if (
      this.detallesRecetaLentesAereos &&
      this.detallesRecetaLentesAereos.length > 0
    ) {
      this.detallesRecetaLentesAereos.forEach((detalle, index) => {
        detalle.numeroDetalle = index + 1;
      });
    }
  }
}
