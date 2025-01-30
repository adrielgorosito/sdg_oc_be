import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { UpdateMarcaDTO } from 'src/marcas/dto/update-marca.dto';
import { UpdateProveedorDTO } from 'src/proveedor/dto/update-proveedor.dto';

export class CreateProductoDTO extends BaseDTO {
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProveedorDTO)
  proveedor: UpdateProveedorDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateMarcaDTO)
  marca: UpdateMarcaDTO;
}
