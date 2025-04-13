import { registerDecorator, ValidationArguments } from 'class-validator';
import { TipoMedioDePagoEnum } from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { CreateMovimientoDTO } from 'src/movimiento/dto/create-movimiento.dto';
import { TipoMovimiento } from 'src/movimiento/enums/tipo-movimiento.enum';

export function ValidateFormaPagoMovimiento() {
  return function (object: CreateMovimientoDTO, propertyName: string) {
    registerDecorator({
      name: 'validateFormaPagoMovimiento',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (object.tipoMovimiento === TipoMovimiento.VENTA) {
            return true;
          }

          const formaPago = (args.object as any).formaPago;
          const formasPagoPosibles = Object.values(TipoMedioDePagoEnum);

          return formasPagoPosibles.includes(formaPago);
        },
        defaultMessage(args: ValidationArguments) {
          return `Para el tipo de movimiento '${args.value}' la forma de pago no es válida. Debe ser 'EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA_BANCARIA', 'CHEQUE', 'CUENTA_CORRIENTE' u OTRO = 'OTRO'`;
        },
      },
    });
  };
}
