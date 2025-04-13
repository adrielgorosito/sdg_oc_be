import { registerDecorator, ValidationOptions } from 'class-validator';
import { TipoDocumento } from 'src/cliente/enums/tipo-documento.enum';

export function ValidateDocumento(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateDocumento',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: number, args: any) {
          const { tipoDocumento } = args.object;

          if (tipoDocumento === TipoDocumento.DNI) {
            return value >= 1000000 && value <= 99999999;
          }

          if (tipoDocumento === TipoDocumento.CUIT) {
            return value >= 1000000000 && value <= 99999999999;
          }

          return true;
        },
        defaultMessage(args: any) {
          const { tipoDocumento } = args.object;
          return tipoDocumento === TipoDocumento.DNI
            ? 'Número de DNI inválido'
            : 'Número de CUIT inválido';
        },
      },
    });
  };
}
