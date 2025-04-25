import { BaseEntity } from 'src/common/entities/base.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TipoMovimiento } from '../enums/tipo-movimiento.enum';

@Entity()
export class Movimiento extends BaseEntity {
  @Column()
  fechaMovimiento: Date;

  @Column()
  tipoMovimiento: TipoMovimiento;

  @Column()
  importe: number;

  @ManyToOne(
    () => CuentaCorriente,
    (cuentaCorriente) => cuentaCorriente.movimientos,
  )
  cuentaCorriente: CuentaCorriente;

  @ManyToOne(() => Venta, (venta) => venta.movimientos, { nullable: true })
  venta: Venta;
}
