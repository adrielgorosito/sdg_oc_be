import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
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

  @IsString()
  @IsOptional()
  numeroFactura: string;

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

  @IsBoolean()
  @IsNotEmpty()
  facturarASuNombre: boolean;
}
