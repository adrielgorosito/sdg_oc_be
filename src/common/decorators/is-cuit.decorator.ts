import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCUIT(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCUIT',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return /^\d{2}-\d{8}-\d{1}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no tiene formato xx-xxxxxxxx-x`;
        },
      },
    });
  };
}
