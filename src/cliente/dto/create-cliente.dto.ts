import { Type } from 'class-transformer';
import {
  IsArray,
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
import { CreateCuentaCorrienteDTO } from 'src/cuenta-corriente/dto/create-cuenta-corriente.dto';

export class CreateClienteDTO extends BaseTransactionalDTO {
  @IsNotEmpty()
  @IsNumber()
  dni: number;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsNotEmpty()
  @IsString()
  sexo: string;

  @IsNotEmpty()
  @IsDate()
  fechaNac: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsNotEmpty()
  @IsString()
  domicilio: string;

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  localidad: RelationDTO;

  @IsArray()
  @ValidateNested()
  @Type(() => RelationDTO)
  clienteObraSocial: RelationDTO[];

  @IsObject()
  @ValidateNested()
  @Type(() => CreateCuentaCorrienteDTO)
  cuentaCorriente: CreateCuentaCorrienteDTO;

  @IsArray()
  @ValidateNested()
  @Type(() => RelationDTO)
  ventas: RelationDTO[];

  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  historiaClinicaLentesContacto: RelationDTO;

  @IsArray()
  @ValidateNested()
  @Type(() => RelationDTO)
  recetasLentesContacto: RelationDTO[];

  @IsArray()
  @ValidateNested()
  @Type(() => RelationDTO)
  audiometrias: RelationDTO[];

  @IsArray()
  @ValidateNested()
  @Type(() => RelationDTO)
  recetaLentesAereos: RelationDTO[];
}
