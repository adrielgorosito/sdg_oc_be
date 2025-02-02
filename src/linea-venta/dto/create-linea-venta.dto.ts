import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { BaseTransactionalDTO } from 'src/common/dtos/baseTransactional.dto';
import { UpdateProductoDTO } from 'src/producto/dto/update-producto.dto';
import { UpdateVentaDTO } from 'src/venta/dto/update-venta.dto';
import { Column } from 'typeorm';

export class CreateLineaVentaDTO extends BaseTransactionalDTO {
  @IsNotEmpty()
  @Column()
  cantidad: number;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateVentaDTO)
  venta: UpdateVentaDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProductoDTO)
  producto: UpdateProductoDTO;

  @IsNotEmpty()
  @Column()
  precioIndividual: number;
}
