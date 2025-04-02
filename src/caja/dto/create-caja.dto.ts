import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCajaDTO {
  @IsNotEmpty()
  @IsNumber()
  importe: number = 0;

  @IsOptional()
  @IsString()
  detalle?: string;
}
