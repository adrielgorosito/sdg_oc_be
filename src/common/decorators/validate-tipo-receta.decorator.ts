import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { TipoReceta } from '../enums/tipo-receta.enum';

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
            if (Array.isArray(value) && value.length === 2) {
              return (
                (value[0].tipo_detalle === 'Cerca' &&
                  value[1].tipo_detalle === 'Lejos') ||
                (value[0].tipo_detalle === 'Lejos' &&
                  value[1].tipo_detalle === 'Cerca')
              );
            }

            return false;
          } else if (
            tipoReceta === TipoReceta.Cerca ||
            tipoReceta === TipoReceta.Lejos
          ) {
            return (
              Array.isArray(value) &&
              value.length === 1 &&
              value[0].tipo_detalle === tipoReceta
            );
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const tipoReceta = (args.object as any).tipoReceta;
          const expectedLength = tipoReceta === TipoReceta.Multifocal ? 2 : 1;
          let errorMessage = `Para recetas de tipo ${tipoReceta}, detallesRecetaLentesAereos debe tener exactamente ${expectedLength} elemento(s). `;

          if (tipoReceta === TipoReceta.Multifocal) {
            errorMessage +=
              'Además, es obligatorio que uno de los elementos tenga tipo_detalle "Cerca" y el otro "Lejos".';
          } else if (
            tipoReceta === TipoReceta.Cerca ||
            tipoReceta === TipoReceta.Lejos
          ) {
            errorMessage += `Además, es obligatorio que tipo_detalle coincida con el tipoReceta ("${tipoReceta}").`;
          }

          return errorMessage;
        },
      },
    });
  };
}
