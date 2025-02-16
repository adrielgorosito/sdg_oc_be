import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class HistoriaClinicaLentesContacto extends BaseEntity {
  @Column()
  patologicas: boolean;

  @Column()
  traumaticas: boolean;

  @Column()
  sens_luz_natural: boolean;

  @Column()
  sens_luz_artificial: boolean;

  @Column()
  sens_humo: boolean;

  @Column()
  sens_frio: boolean;

  @Column()
  sens_polvo: boolean;

  @Column()
  observaciones_sens: string;

  @Column()
  transtornos_neurologicos: boolean;

  @Column()
  regimen_eventual: boolean;

  @Column()
  glandulas_endocinas: boolean;

  @Column()
  sistema_cardiovascular: boolean;

  @Column()
  embarazo: boolean;

  @Column()
  estomatologia: boolean;

  @Column()
  caries: boolean;

  @Column()
  digestivo: boolean;

  @Column()
  alergia_digestiva: boolean;

  @Column()
  alergia_respiratoria: boolean;

  @Column()
  alergia_cutanea: boolean;

  @Column()
  alergia_otras: boolean;

  @Column()
  rinitis_primaveral: boolean;

  @Column()
  sinusitis_cronica: boolean;

  @Column()
  observaciones_antecedentes: string;

  @Column()
  antibioticos: boolean;

  @Column()
  antiestaminicos: boolean;

  @Column()
  pildora_contraceptiva: boolean;

  @Column()
  anorexigenos: boolean;

  @Column()
  neurolepticos: boolean;

  @Column()
  tratamiento_digestivo: boolean;

  @Column()
  dirueticos: boolean;

  @Column()
  tranquilizantes: boolean;

  @Column()
  corticoides: boolean;

  @Column()
  parasimpaticoliticos: boolean;

  @OneToOne(() => Cliente)
  @JoinColumn()
  cliente: Cliente;
}
