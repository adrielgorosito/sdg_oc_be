import { Cliente } from 'src/cliente/entities/cliente.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Estado } from '../enum/estado.enum';

@Entity()
export class CuentaCorriente extends BaseEntity {
  @Column('decimal', { precision: 9, scale: 2, default: 0 })
  saldo: number;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.cuentaCorriente)
  movimientos: Movimiento[];

  @Column({ enum: Estado, default: Estado.ACTIVO })
  estado: Estado;

  @OneToOne(() => Cliente)
  @JoinColumn()
  cliente: Cliente;
}
