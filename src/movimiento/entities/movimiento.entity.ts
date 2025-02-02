import { BaseEntity } from 'src/common/entities/base.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class Movimiento extends BaseEntity {
  @ManyToOne(
    () => CuentaCorriente,
    (cuentaCorriente) => cuentaCorriente.movimientos,
  )
  cuentaCorriente: CuentaCorriente;
}
