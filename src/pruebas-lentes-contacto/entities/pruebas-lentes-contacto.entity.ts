import { BaseEntity } from 'src/common/entities/base.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

@Entity()
@Unique(['numeroPrueba', 'recetaLentesContacto'])
export class PruebasLentesContacto extends BaseEntity {
  @Column()
  numeroPrueba: number;

  @Column()
  od_diametro: number;

  @Column()
  od_eje: number;

  @Column()
  od_cilindrico: number;

  @Column()
  od_esferico: number;

  @Column()
  od_cb: number;

  @Column()
  od_marca: string;

  @Column()
  oi_diametro: number;

  @Column()
  oi_eje: number;

  @Column()
  oi_cilindrico: number;

  @Column()
  oi_esferico: number;

  @Column()
  oi_cb: number;

  @Column()
  oi_marca: string;

  @Column()
  confort: boolean;

  @Column()
  movilidad: boolean;

  @Column()
  centraje: boolean;

  @Column()
  hiperemia: boolean;

  @Column()
  agudeza_visual: boolean;

  @Column()
  oi_edema: boolean;

  @Column()
  od_edema: boolean;

  @Column()
  observaciones: string;

  @ManyToOne(
    () => RecetaLentesContacto,
    (recetaLentesContacto) => recetaLentesContacto.pruebasLentesContacto,
    { onDelete: 'CASCADE' },
  )
  recetaLentesContacto: RecetaLentesContacto;
}
