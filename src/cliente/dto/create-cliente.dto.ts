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
import { CreateClienteObraSocialDTO } from 'src/cliente-obra-social/dto/create-cliente-obra-social.dto';
import { UniqueObraSocial } from 'src/common/decorators/unique-obra-social.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CreateCuentaCorrienteDTO } from 'src/cuenta-corriente/dto/create-cuenta-corriente.dto';

export class CreateClienteDTO extends BaseDTO {
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

  @IsOptional()
  @IsArray()
  @UniqueObraSocial()
  @ValidateNested()
  @Type(() => CreateClienteObraSocialDTO)
  clienteObrasSociales: CreateClienteObraSocialDTO[];

  @ValidateNested()
  @Type(() => CreateCuentaCorrienteDTO)
  cuentaCorriente: CreateCuentaCorrienteDTO;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RelationDTO)
  historiaClinicaLentesContacto: RelationDTO;
}
