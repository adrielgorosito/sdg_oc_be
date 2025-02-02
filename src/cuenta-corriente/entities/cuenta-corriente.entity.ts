import { BaseEntity } from 'src/common/entities/base.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class CuentaCorriente extends BaseEntity {
  @Column('decimal', { precision: 9, scale: 2 })
  saldo: number;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.cuentaCorriente)
  movimientos: Movimiento[];

  @OneToOne(() => Cliente, (cliente) => cliente.cuentaCorriente, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cliente: Cliente;
}
