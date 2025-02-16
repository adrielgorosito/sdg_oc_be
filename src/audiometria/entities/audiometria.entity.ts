import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Audiometria extends BaseEntity {
  @Column()
  fechaInforme: Date;

  @Column()
  linkPDF: string;

  @Column()
  observaciones: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.audiometrias, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;
}
