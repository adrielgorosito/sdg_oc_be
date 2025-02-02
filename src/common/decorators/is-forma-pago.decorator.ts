import { registerDecorator, ValidationArguments } from 'class-validator';
import { FormaPago } from '../enums/forma-pago.enum';

export function IsFormaPago() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFormaPago',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          const formasPagoPosibles = Object.values(FormaPago);
          return formasPagoPosibles.includes(value as FormaPago);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no es una forma de pago válida. Debe ser 'Total' o 'CuentaCorriente'`;
        },
      },
    });
  };
}
