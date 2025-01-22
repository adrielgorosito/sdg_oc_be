import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { ProductoDTO } from 'src/productos/dto/producto.dto';

export class MarcaDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: ProductoDTO[];

  @IsOptional()
  @IsString()
  descripcion: string;
}
