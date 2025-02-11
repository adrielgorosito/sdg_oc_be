import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateClienteDTO } from 'src/cliente/dto/create-cliente.dto';
import { IsEstesiometria } from 'src/common/decorators/is-estesiometria.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';

export class CreateRecetaLentesContactoDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  oftalmologo: string;

  @IsNumber()
  @IsNotEmpty()
  quet_m1_od: number;

  @IsNumber()
  @IsNotEmpty()
  quet_m2_od: number;

  @IsNumber()
  @IsNotEmpty()
  quet_m1_oi: number;

  @IsNumber()
  @IsNotEmpty()
  quet_m2_oi: number;

  @IsString()
  @IsNotEmpty()
  observaciones_queterometria: string;

  @IsBoolean()
  @IsNotEmpty()
  maquillaje: boolean;

  @IsBoolean()
  @IsNotEmpty()
  tonicidad: boolean;

  @IsBoolean()
  @IsNotEmpty()
  hendidura_palpebral: boolean;

  @IsBoolean()
  @IsNotEmpty()
  altura_palpebral: boolean;

  @IsBoolean()
  @IsNotEmpty()
  buen_parpadeo_ritmo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  buen_parpadeo_amplitud: boolean;

  @IsString()
  @IsNotEmpty()
  @IsEstesiometria()
  estesiometria: string;

  @IsNumber()
  @IsNotEmpty()
  od_cb: number;

  @IsNumber()
  @IsNotEmpty()
  od_esferico: number;

  @IsNumber()
  @IsNotEmpty()
  od_cilindrico: number;

  @IsNumber()
  @IsNotEmpty()
  od_eje: number;

  @IsNumber()
  @IsNotEmpty()
  od_diametro: number;

  @IsNumber()
  @IsNotEmpty()
  od_marca: number;

  @IsNumber()
  @IsNotEmpty()
  oi_cb: number;

  @IsNumber()
  @IsNotEmpty()
  oi_esferico: number;

  @IsNumber()
  @IsNotEmpty()
  oi_cilindrico: number;

  @IsNumber()
  @IsNotEmpty()
  oi_eje: number;

  @IsNumber()
  @IsNotEmpty()
  oi_diametro: number;

  @IsNumber()
  @IsNotEmpty()
  oi_marca: number;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateClienteDTO)
  cliente: CreateClienteDTO;
}
