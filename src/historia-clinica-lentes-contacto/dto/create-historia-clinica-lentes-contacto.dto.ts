import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateHistoriaClinicaLentesContactoDTO extends BaseDTO {
  @IsBoolean()
  @IsNotEmpty()
  patologicas: boolean;

  @IsBoolean()
  @IsNotEmpty()
  traumaticas: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sens_luz_natural: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sens_luz_artificial: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sens_humo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sens_frio: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sens_polvo: boolean;

  @IsString()
  @IsOptional()
  observaciones_sens: string;

  @IsBoolean()
  @IsNotEmpty()
  transtornos_neurologicos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  regimen_eventual: boolean;

  @IsBoolean()
  @IsNotEmpty()
  glandulas_endocinas: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sistema_cardiovascular: boolean;

  @IsBoolean()
  @IsNotEmpty()
  embarazo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  estomatologia: boolean;

  @IsBoolean()
  @IsNotEmpty()
  caries: boolean;

  @IsBoolean()
  @IsNotEmpty()
  digestivo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  alergia_digestiva: boolean;

  @IsBoolean()
  @IsNotEmpty()
  alergia_respiratoria: boolean;

  @IsBoolean()
  @IsNotEmpty()
  alergia_cutanea: boolean;

  @IsBoolean()
  @IsNotEmpty()
  alergia_otras: boolean;

  @IsBoolean()
  @IsNotEmpty()
  rinitis_primaveral: boolean;

  @IsBoolean()
  @IsNotEmpty()
  sinusitis_cronica: boolean;

  @IsString()
  @IsOptional()
  observaciones_antecedentes: string;

  @IsBoolean()
  @IsNotEmpty()
  antibioticos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  antiestaminicos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  pildora_contraceptiva: boolean;

  @IsBoolean()
  @IsNotEmpty()
  anorexigenos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  neurolepticos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  tratamiento_digestivo: boolean;

  @IsBoolean()
  @IsNotEmpty()
  dirueticos: boolean;

  @IsBoolean()
  @IsNotEmpty()
  tranquilizantes: boolean;

  @IsBoolean()
  @IsNotEmpty()
  corticoides: boolean;

  @IsBoolean()
  @IsNotEmpty()
  parasimpaticoliticos: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  cliente: RelationDTO;
}
