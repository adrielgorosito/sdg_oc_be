import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateHistoriaClinicaLentesContactoDTO extends BaseDTO {
  @IsOptional()
  @IsBoolean()
  patologicas: boolean;

  @IsOptional()
  @IsBoolean()
  traumaticas: boolean;

  @IsBoolean()
  @IsOptional()
  sensLuzNatural: boolean;

  @IsOptional()
  @IsBoolean()
  sensLuzArtificial: boolean;

  @IsOptional()
  @IsBoolean()
  sensHumo: boolean;

  @IsOptional()
  @IsBoolean()
  sensFrio: boolean;

  @IsOptional()
  @IsBoolean()
  sensPolvo: boolean;

  @IsString()
  @IsOptional()
  observacionesSens: string;

  @IsBoolean()
  @IsOptional()
  transtornosNeurologicos: boolean;

  @IsBoolean()
  @IsOptional()
  regimenEventual: boolean;

  @IsBoolean()
  @IsOptional()
  glandulasEndocinas: boolean;

  @IsBoolean()
  @IsOptional()
  sistemaCardiovascular: boolean;

  @IsBoolean()
  @IsOptional()
  embarazo: boolean;

  @IsBoolean()
  @IsOptional()
  estomatologia: boolean;

  @IsBoolean()
  @IsOptional()
  caries: boolean;

  @IsBoolean()
  @IsOptional()
  digestivo: boolean;

  @IsBoolean()
  @IsOptional()
  alergiaDigestiva: boolean;

  @IsBoolean()
  @IsOptional()
  alergiaRespiratoria: boolean;

  @IsBoolean()
  @IsOptional()
  alergiaCutanea: boolean;

  @IsBoolean()
  @IsOptional()
  alergiaOtras: boolean;

  @IsBoolean()
  @IsOptional()
  rinitisPrimaveral: boolean;

  @IsBoolean()
  @IsOptional()
  sinusitisCronica: boolean;

  @IsString()
  @IsOptional()
  observacionesAntecedentes: string;

  @IsBoolean()
  @IsOptional()
  antibioticos: boolean;

  @IsBoolean()
  @IsOptional()
  antiestaminicos: boolean;

  @IsBoolean()
  @IsOptional()
  pildoraContraceptiva: boolean;

  @IsBoolean()
  @IsOptional()
  anorexigenos: boolean;

  @IsBoolean()
  @IsOptional()
  neurolepticos: boolean;

  @IsBoolean()
  @IsOptional()
  tratamientoDigestivo: boolean;

  @IsBoolean()
  @IsOptional()
  dirueticos: boolean;

  @IsBoolean()
  @IsOptional()
  tranquilizantes: boolean;

  @IsBoolean()
  @IsOptional()
  corticoides: boolean;

  @IsBoolean()
  @IsOptional()
  parasimpaticoliticos: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  cliente: RelationDTO;
}
