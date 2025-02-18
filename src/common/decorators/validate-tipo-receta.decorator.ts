import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { TipoReceta } from '../../receta-lentes-aereos/enum/tipo-receta.enum';

export function ValidateTipoReceta(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateTipoReceta',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any[], args: ValidationArguments) {
          const tipoReceta = (args.object as any).tipoReceta;

          if (tipoReceta === TipoReceta.Multifocal) {
            return Array.isArray(value) && value.length === 2;
          } else if (
            tipoReceta === TipoReceta.Cerca ||
            tipoReceta === TipoReceta.Lejos
          ) {
            return Array.isArray(value) && value.length === 1;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const tipoReceta = (args.object as any).tipoReceta;
          const expectedLength = tipoReceta === TipoReceta.Multifocal ? 2 : 1;
          return `Para recetas de tipo ${tipoReceta}, detallesRecetaLentesAereos debe tener exactamente ${expectedLength} elemento(s)`;
        },
      },
    });
  };
}
