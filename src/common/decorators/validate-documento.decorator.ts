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
        defaultMessage() {
          return 'Número de documento inválido';
        },
      },
    });
  };
}
