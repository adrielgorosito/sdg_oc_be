import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsTipoFacturaValida(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTipoFacturaValida',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value === 1 || value === 6 || value === 11 || value === 51;
        },
        defaultMessage() {
          return 'El tipo de factura no es válido';
        },
      },
    });
  };
}
