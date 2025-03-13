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

  @Column('decimal', { precision: 9, scale: 2 })
  od_esferico: number;

  @Column('decimal', { precision: 9, scale: 2 })
  od_cilindrico: number;

  @Column('decimal', { precision: 9, scale: 2 })
  od_grados: number;

  @Column('decimal', { precision: 9, scale: 2 })
  oi_esferico: number;

  @Column('decimal', { precision: 9, scale: 2 })
  oi_cilindrico: number;

  @Column('decimal', { precision: 9, scale: 2 })
  oi_grados: number;

  @Column('decimal', { precision: 9, scale: 2 })
  dnp: number;

  @ManyToOne(
    () => RecetaLentesAereos,
    (recetaLentesAereos) => recetaLentesAereos.detallesRecetaLentesAereos,
    { onDelete: 'CASCADE' },
  )
  recetaLentesAereos: RecetaLentesAereos;
}
