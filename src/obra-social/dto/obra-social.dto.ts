import { IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class ObraSocialDTO extends BaseDTO {
  @IsString()
  nombre: string;
}
