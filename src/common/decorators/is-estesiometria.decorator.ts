import { registerDecorator, ValidationArguments } from 'class-validator';
import { Estesiometria } from '../enums/estesiometria.enum';

export function IsEstesiometria() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsEstesiometria',
      target: object.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: any) {
          const estesiometria = Object.values(Estesiometria);
          return estesiometria.includes(value as Estesiometria);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no es un tipo de estesiometría válido. Debe ser 'Hiperestésico', 'Normoestésico' o 'Hipoestésico'.`;
        },
      },
    });
  };
}
