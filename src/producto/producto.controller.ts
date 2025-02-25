import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductoDTO } from './dto/create-producto.dto';
import { PaginateProductoDTO } from './dto/paginate-producto.dto';
import { UpdateProductoDTO } from './dto/update-producto.dto';
import { ProductoService } from './producto.service';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  findAll(@Query() paginateProductoDTO: PaginateProductoDTO) {
    return this.productoService.findAll(paginateProductoDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productoService.findOne(id);
  }

  @Post()
  create(@Body() productoDTO: CreateProductoDTO) {
    return this.productoService.create(productoDTO);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() productoDTO: UpdateProductoDTO) {
    return this.productoService.update(id, productoDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productoService.remove(id);
  }
}
