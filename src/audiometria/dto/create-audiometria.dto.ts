import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';

export class CreateAudiometriaDTO extends BaseDTO {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  fechaInforme: Date;

  @IsString()
  @IsOptional()
  linkPDF: string;

  @IsString()
  @IsOptional()
  observaciones: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  cliente: RelationDTO;
}
