import { TipoReceta } from 'src/common/enums/tipo-receta.enum';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class DetallesRecetaLentesAereos {
  @PrimaryColumn()
  numeroDetalle: number;

  @PrimaryColumn()
  recetaLentesAereosId: number;

  @Column({ enum: TipoReceta })
  tipo_detalle: string;

  @Column()
  od_esferico: string;

  @Column()
  od_cilindrico: string;

  @Column()
  od_grados: string;

  @Column()
  od_dnp: string;

  @Column()
  od_diametro: string;

  @Column()
  oi_esferico: string;

  @Column()
  oi_cilindrico: string;

  @Column()
  oi_grados: string;

  @Column()
  oi_dnp: string;

  @Column()
  oi_diametro: string;

  @Column({ nullable: true })
  observaciones: string;

  @ManyToOne(
    () => RecetaLentesAereos,
    (recetaLentesAereos) => recetaLentesAereos.detallesRecetaLentesAereos,
    { onDelete: 'CASCADE' },
  )
  recetaLentesAereos: RecetaLentesAereos;
}
