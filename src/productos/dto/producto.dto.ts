import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dtos/base.dto';
import { MarcaDTO } from 'src/marcas/dto/marca.dto';
import { ProveedorDTO } from 'src/proveedor/dto/proveedor.dto';

export class ProductoDTO extends BaseDTO {
  @IsOptional()
  @IsString()
  descripcion: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ProveedorDTO)
  proveedor: ProveedorDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => MarcaDTO)
  marca: MarcaDTO;
}
