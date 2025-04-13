import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateObraSocialDTO extends BaseDTO {
  @IsNotEmpty()
  @IsString()
  nombre: string;
}
