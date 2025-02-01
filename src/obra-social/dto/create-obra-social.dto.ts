import { IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateObraSocialDTO extends BaseDTO {
  @IsString()
  nombre: string;
}
