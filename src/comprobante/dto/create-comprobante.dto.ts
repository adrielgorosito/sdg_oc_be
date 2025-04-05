import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RelationTransactionalDTO } from 'src/common/dtos/relation-transactional.dto';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';
export class CrearComprobanteDTO {
  @IsOptional()
  @IsNumber()
  importeTotal?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(TipoComprobante)
  tipoComprobante?: TipoComprobante;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationTransactionalDTO)
  transaccionRelacionadaId?: RelationTransactionalDTO;

  @IsOptional()
  @IsString()
  motivo?: string;
}
