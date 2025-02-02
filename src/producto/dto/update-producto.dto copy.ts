import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDTO } from './create-producto.dto';

export class UpdateProductoDTO extends PartialType(CreateProductoDTO) {}
