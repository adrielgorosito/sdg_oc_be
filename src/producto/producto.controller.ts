import { ProductoService } from './producto.service';
import { CreateProductoDTO } from './dto/create-producto.dto';
import { UpdateProductoDTO } from './dto/update-producto.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  findAll() {
    return this.productoService.findAll();
  }

  @Post()
  createOne(@Body() productoDTO: CreateProductoDTO) {
    return this.productoService.create(productoDTO);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productoService.findOne(id);
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
