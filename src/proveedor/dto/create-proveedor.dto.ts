import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsCUIT } from 'src/common/decorators/is-cuit.decorator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { CreateProductoDTO } from 'src/productos/dto/create-producto.dto';

export class CreateProveedorDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: CreateProductoDTO[];

  @IsNotEmpty()
  @IsString()
  @IsCUIT()
  cuit: string;

  @IsNotEmpty()
  @IsString()
  razonSocial: string;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
