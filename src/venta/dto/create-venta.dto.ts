import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { BaseTransactionalDTO } from 'src/common/dtos/baseTransactional.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CreateLineaVentaDTO } from 'src/linea-venta/dto/create-linea-venta.dto';
import { CreateMedioDePagoDto } from 'src/medio-de-pago/dto/create-medio-de-pago.dto';

export class CreateVentaDTO extends BaseTransactionalDTO {
  @IsNotEmpty()
  @IsDate()
  fecha: Date;

  @IsNumber()
  @IsOptional()
  numeroFactura: number;

  @IsOptional()
  @IsNumber()
  descuentoPorcentaje: number;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  cliente: RelationDTO;

  @IsArray()
  @ValidateNested()
  @Type(() => CreateMedioDePagoDto)
  mediosDePago: CreateMedioDePagoDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateLineaVentaDTO)
  lineasDeVenta: CreateLineaVentaDTO[];
}
