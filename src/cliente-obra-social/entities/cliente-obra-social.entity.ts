import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class ClienteObraSocial extends BaseEntity {
  @ManyToOne(() => Cliente, (cliente) => cliente.clienteObrasSociales, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @ManyToOne(() => ObraSocial, (obraSocial) => obraSocial.clienteObraSocial, {
    onDelete: 'CASCADE',
  })
  obraSocial: ObraSocial;

  @Column()
  numeroSocio: string;
}
