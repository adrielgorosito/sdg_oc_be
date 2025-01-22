import { IsArray, IsOptional } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { ProductoDTO } from 'src/productos/dto/producto.dto';

export class ProveedorDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: ProductoDTO[];
}
