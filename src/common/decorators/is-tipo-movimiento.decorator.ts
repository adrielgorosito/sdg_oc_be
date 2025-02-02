import { registerDecorator, ValidationArguments } from 'class-validator';
import { TipoMovimiento } from '../enums/tipo-movimiento.enum';

export function IsTipoMovimiento() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTipoMovimiento',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          const movimientosPosibles = Object.values(TipoMovimiento);
          return movimientosPosibles.includes(value as TipoMovimiento);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no es un tipo de movimiento válido. Debe ser 'Entrega', 'Devolución' o 'Venta'.`;
        },
      },
    });
  };
}
