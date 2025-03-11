import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoReceta } from 'src/common/enums/tipo-receta.enum';

export class CreateDetallesRecetaLentesAereosDTO {
  @IsString()
  @IsEnum(TipoReceta)
  tipo_detalle: string;

  @IsNumber()
  od_esferico: number;

  @IsNumber()
  od_cilindrico: number;

  @IsNumber()
  od_grados: number;

  @IsNumber()
  oi_esferico: number;

  @IsNumber()
  oi_cilindrico: number;

  @IsNumber()
  oi_grados: number;

  @IsNumber()
  dnp: number;

  @IsOptional()
  @IsString()
  observaciones: string;
}
