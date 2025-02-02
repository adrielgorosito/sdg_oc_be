import { BaseEntity } from 'src/common/entities/base.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Movimiento extends BaseEntity {
  @Column()
  fechaMovimiento: Date;

  @Column()
  tipoMovimiento: string;

  @Column()
  importe: number;

  @Column()
  formaPago: string;

  @ManyToOne(
    () => CuentaCorriente,
    (cuentaCorriente) => cuentaCorriente.movimientos,
  )
  cuentaCorriente: CuentaCorriente;
}
