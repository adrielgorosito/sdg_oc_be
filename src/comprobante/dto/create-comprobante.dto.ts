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
import { CondicionIva } from '../enums/condicion-iva.enum';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';

export class CrearComprobanteDTO {
  @IsOptional()
  @IsNumber()
  importeTotal: number;

  @IsNotEmpty()
  @IsEnum(TipoComprobante)
  tipoComprobante: TipoComprobante;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationTransactionalDTO)
  facturaRelacionada?: RelationTransactionalDTO;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationTransactionalDTO)
  venta?: RelationTransactionalDTO;

  @IsEnum(CondicionIva)
  condicionIvaCliente: CondicionIva;

  @IsOptional()
  @IsString()
  motivo?: string;
}
