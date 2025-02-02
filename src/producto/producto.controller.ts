import { CreateProductoDTO } from './dto/create-producto.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductosService } from './producto.service';
import { UpdateProductoDTO } from './dto/update-producto.dto copy';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Post()
  createOne(@Body() productoDTO: CreateProductoDTO) {
    return this.productosService.create(productoDTO);
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  updateOne(@Param('id') id: number, @Body() productoDTO: UpdateProductoDTO) {
    return this.productosService.update(id, productoDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productosService.remove(id);
  }
}
