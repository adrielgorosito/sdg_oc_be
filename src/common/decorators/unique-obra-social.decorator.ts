import { registerDecorator, ValidationOptions } from 'class-validator';
import { CreateClienteObraSocialDTO } from 'src/cliente-obra-social/dto/create-cliente-obra-social.dto';

export function UniqueObraSocial(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueObraSocialIds',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: CreateClienteObraSocialDTO[]) {
          console.log(value);

          if (!Array.isArray(value)) return false;

          const obraSocialIds = value.map((item) => item.obraSocial.id);
          const uniqueIds = new Set(obraSocialIds);

          return obraSocialIds.length === uniqueIds.size;
        },
        defaultMessage() {
          return 'Solo se puede relacionar una vez una obra social con un cliente';
        },
      },
    });
  };
}
