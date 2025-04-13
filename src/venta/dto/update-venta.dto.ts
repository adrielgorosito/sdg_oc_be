import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CreateLineaVentaDTO } from 'src/linea-venta/dto/create-linea-venta.dto';
import { CreateMedioDePagoDto } from 'src/medio-de-pago/dto/create-medio-de-pago.dto';

export class UpdateVentaDTO {
  @IsOptional()
  @IsDate()
  fecha: Date;

  @IsNumber()
  @IsOptional()
  numeroFactura: number;

  @IsOptional()
  @IsNumber()
  descuentoPorcentaje: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  cliente: RelationDTO;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => CreateMedioDePagoDto)
  mediosDePago: CreateMedioDePagoDto[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateLineaVentaDTO)
  lineasDeVenta: CreateLineaVentaDTO[];
}
