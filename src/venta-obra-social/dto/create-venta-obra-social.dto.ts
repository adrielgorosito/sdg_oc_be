import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CondicionIva } from 'src/facturador/enums/condicion-iva.enum';

export class CreateVentaObraSocialDTO {
  @IsNotEmpty()
  @IsString()
  obraSocialId: string;

  @IsNotEmpty()
  @IsNumber()
  importe: number;

  @IsNotEmpty()
  @IsEnum(CondicionIva)
  condicionIva: CondicionIva;
}
