import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateClienteObraSocialDTO } from 'src/cliente-obra-social/dto/create-cliente-obra-social.dto';
import { TipoDocumento } from 'src/cliente/enums/tipo-documento.enum';
import { UniqueObraSocial } from 'src/common/decorators/unique-obra-social.decorator';
import { ValidateDocumento } from 'src/common/decorators/validate-documento.decorator';
import { ValidateTipoDocumento } from 'src/common/decorators/validate-tipo-documento.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { RelationDTO } from 'src/common/dtos/relation.dto';
import { CreateCuentaCorrienteDTO } from 'src/cuenta-corriente/dto/create-cuenta-corriente.dto';
import { TipoContribuyente } from 'src/facturador/enums/condicion-iva.enum';

export class CreateClienteDTO extends BaseDTO {
  @ValidateDocumento()
  nroDocumento: number;

  @IsNotEmpty()
  @IsEnum(TipoDocumento)
  @ValidateTipoDocumento()
  tipoDocumento: TipoDocumento;

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

  @IsNotEmpty()
  @IsEnum(TipoContribuyente)
  categoriaFiscal: TipoContribuyente;

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
