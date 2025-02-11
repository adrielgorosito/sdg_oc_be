import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class RecetaLentesContacto extends BaseEntity {
  @Column()
  oftalmologo: string;

  @Column()
  quet_m1_od: number;

  @Column()
  quet_m2_od: number;

  @Column()
  quet_m1_oi: number;

  @Column()
  quet_m2_oi: number;

  @Column()
  observaciones_queterometria: string;

  @Column()
  maquillaje: boolean;

  @Column()
  tonicidad: boolean;

  @Column()
  hendidura_palpebral: boolean;

  @Column()
  altura_palpebral: boolean;

  @Column()
  buen_parpadeo_ritmo: boolean;

  @Column()
  buen_parpadeo_amplitud: boolean;

  @Column()
  estesiometria: string;

  @Column()
  od_cb: number;

  @Column()
  od_esferico: number;

  @Column()
  od_cilindrico: number;

  @Column()
  od_eje: number;

  @Column()
  od_diametro: number;

  @Column()
  od_marca: number;

  @Column()
  oi_cb: number;

  @Column()
  oi_esferico: number;

  @Column()
  oi_cilindrico: number;

  @Column()
  oi_eje: number;

  @Column()
  oi_diametro: number;

  @Column()
  oi_marca: number;

  @Column()
  observaciones: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.recetasLentesContacto, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;
}
