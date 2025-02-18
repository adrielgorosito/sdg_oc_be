import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class HistoriaClinicaLentesContacto extends BaseEntity {
  @Column({ default: false })
  patologicas: boolean;

  @Column({ default: false })
  traumaticas: boolean;

  @Column({ default: false })
  sensLuzNatural: boolean;

  @Column({ default: false })
  sensLuzArtificial: boolean;

  @Column({ default: false })
  sensHumo: boolean;

  @Column({ default: false })
  sensFrio: boolean;

  @Column({ default: false })
  sensPolvo: boolean;

  @Column({ default: null, nullable: true })
  observacionesSens: string;

  @Column({ default: false })
  transtornosNeurologicos: boolean;

  @Column({ default: false })
  regimenEventual: boolean;

  @Column({ default: false })
  glandulasEndocinas: boolean;

  @Column({ default: false })
  sistemaCardiovascular: boolean;

  @Column({ default: false })
  embarazo: boolean;

  @Column({ default: false })
  estomatologia: boolean;

  @Column({ default: false })
  caries: boolean;

  @Column({ default: false })
  digestivo: boolean;

  @Column({ default: false })
  alergiaDigestiva: boolean;

  @Column({ default: false })
  alergiaRespiratoria: boolean;

  @Column({ default: false })
  alergiaCutanea: boolean;

  @Column({ default: false })
  alergiaOtras: boolean;

  @Column({ default: false })
  rinitisPrimaveral: boolean;

  @Column({ default: false })
  sinusitisCronica: boolean;

  @Column({ default: null, nullable: true })
  observacionesAntecedentes: string;

  @Column({ default: false })
  antibioticos: boolean;

  @Column({ default: false })
  antiestaminicos: boolean;

  @Column({ default: false })
  pildoraContraceptiva: boolean;

  @Column({ default: false })
  anorexigenos: boolean;

  @Column({ default: false })
  neurolepticos: boolean;

  @Column({ default: false })
  tratamientoDigestivo: boolean;

  @Column({ default: false })
  dirueticos: boolean;

  @Column({ default: false })
  tranquilizantes: boolean;

  @Column({ default: false })
  corticoides: boolean;

  @Column({ default: false })
  parasimpaticoliticos: boolean;

  @OneToOne(() => Cliente)
  @JoinColumn()
  cliente: Cliente;
}
