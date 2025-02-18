import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreatePruebasLentesContactoDTO extends BaseDTO {
  @IsNumber()
  @IsNotEmpty()
  od_diametro: number;

  @IsNumber()
  @IsNotEmpty()
  od_eje: number;

  @IsNumber()
  @IsNotEmpty()
  od_cilindrico: number;

  @IsNumber()
  @IsNotEmpty()
  od_esferico: number;

  @IsNumber()
  @IsNotEmpty()
  od_cb: number;

  @IsString()
  @IsNotEmpty()
  od_marca: string;

  @IsNumber()
  @IsNotEmpty()
  oi_diametro: number;

  @IsNumber()
  @IsNotEmpty()
  oi_eje: number;

  @IsNumber()
  @IsNotEmpty()
  oi_cilindrico: number;

  @IsNumber()
  @IsNotEmpty()
  oi_esferico: number;

  @IsNumber()
  @IsNotEmpty()
  oi_cb: number;

  @IsString()
  @IsNotEmpty()
  oi_marca: string;

  @IsBoolean()
  @IsNotEmpty()
  confort: boolean;

  @IsBoolean()
  @IsNotEmpty()
  movilidad: boolean;

  @IsBoolean()
  @IsNotEmpty()
  centraje: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hiperemia: boolean;

  @IsBoolean()
  @IsNotEmpty()
  agudeza_visual: boolean;

  @IsBoolean()
  @IsNotEmpty()
  oi_edema: boolean;

  @IsBoolean()
  @IsNotEmpty()
  od_edema: boolean;

  @IsString()
  @IsOptional()
  observaciones: string;
}
