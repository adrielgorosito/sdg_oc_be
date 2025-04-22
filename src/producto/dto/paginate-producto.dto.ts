import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';
import { CategoriaEnum } from '../enums/categoria.enum';

export class PaginateProductoDTO extends PaginationDTO {
  @IsOptional()
  @IsString()
  categoria?: CategoriaEnum;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  nombreMarca?: string;

  @IsOptional()
  @IsString()
  razonSocialProveedor?: string;

  @IsOptional()
  @IsNumber()
  marcaId?: number;

  @IsOptional()
  @IsNumber()
  proveedorId?: number;

  @IsOptional()
  @IsString()
  cod?: string;
}
