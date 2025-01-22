import { ProductoDTO } from './dto/producto.dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}
  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Post()
  createOne(@Body() productoDTO: ProductoDTO) {
    return this.productosService.create(productoDTO);
  }
}
