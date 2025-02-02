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
import { ProductosService } from './productos.service';
import { UpdateProductoDTO } from './dto/update-producto.dto copy';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}
  @Get()
  async findAll() {
    return await this.productosService.findAll();
  }

  @Post()
  async createOne(@Body() productoDTO: CreateProductoDTO) {
    return await this.productosService.create(productoDTO);
  }
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.productosService.findOne(id);
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() productoDTO: UpdateProductoDTO,
  ) {
    return await this.productosService.update(id, productoDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.productosService.remove(id);
  }
}
