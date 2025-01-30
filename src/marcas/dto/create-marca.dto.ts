import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { UpdateProductoDTO } from 'src/productos/dto/update-producto.dto copy';

export class CreateMarcaDTO extends BaseDTO {
  @IsOptional()
  @IsArray()
  productos: UpdateProductoDTO[];

  @IsNotEmpty()
  @IsString()
  nombre: string;
}
