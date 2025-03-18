import { registerDecorator, ValidationOptions } from 'class-validator';
import { TipoDocumento } from 'src/cliente/enums/tipo-documento.enum';
import { CondicionIva } from 'src/facturador/enums/condicion-iva.enum';

export function ValidateTipoDocumento(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateTipoDocumento',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: any) {
          const { categoriaFiscal } = args.object;
          if (categoriaFiscal === CondicionIva.RESPONSABLE_INSCRIPTO) {
            return value === TipoDocumento.CUIT;
          }
          return true;
        },
        defaultMessage() {
          return 'Responsable Inscripto debe tener tipo de documento CUIT';
        },
      },
    });
  };
}
