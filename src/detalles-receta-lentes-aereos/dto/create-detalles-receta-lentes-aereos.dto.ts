import { IsOptional, IsString } from 'class-validator';

export class CreateDetallesRecetaLentesAereosDTO {
  @IsString()
  od_esferico: string;

  @IsString()
  od_cilindrico: string;

  @IsString()
  od_grados: string;

  @IsString()
  od_dnp: string;

  @IsString()
  od_diametro: string;

  @IsString()
  oi_esferico: string;

  @IsString()
  oi_cilindrico: string;

  @IsString()
  oi_grados: string;

  @IsString()
  oi_dnp: string;

  @IsString()
  oi_diametro: string;

  @IsOptional()
  @IsString()
  observaciones: string;
}
