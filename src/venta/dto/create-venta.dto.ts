import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseTransactionalDTO } from 'src/common/dtos/baseTransactional.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CondicionIva } from 'src/facturador/enums/condicion-iva.enum';
import { CreateLineaVentaDTO } from 'src/linea-venta/dto/create-linea-venta.dto';
import { CreateMedioDePagoDto } from 'src/medio-de-pago/dto/create-medio-de-pago.dto';
import { CreateVentaObraSocialDTO } from 'src/venta-obra-social/dto/create-venta-obra-social.dto';

export class CreateVentaDTO extends BaseTransactionalDTO {
  @IsNotEmpty()
  @IsDate()
  fecha: Date;

  @IsString()
  @IsOptional()
  numeroFactura: string;

  @IsOptional()
  @IsNumber()
  descuentoPorcentaje: number = 0;

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

  @IsEnum(CondicionIva)
  @IsNotEmpty()
  condicionIva: CondicionIva;

  @IsString()
  @IsOptional()
  observaciones: string;

  @IsArray()
  @ValidateNested()
  @Type(() => CreateVentaObraSocialDTO)
  ventaObraSocial: CreateVentaObraSocialDTO[];
}
