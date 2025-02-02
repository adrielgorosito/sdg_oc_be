import { Controller } from '@nestjs/common';
import { VentasService } from './venta.service';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  /* @Get()
  findAll() {
    return this.ventasService.findAll();
  } */

  /*  @Post()
  createOne(@Body() ventaDTO: CreateVentaDTO) {
    return this.ventasService.create(ventaDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id')
  updateOne(@Param('id') id: number, @Body() ventaDTO: UpdateVentaDTO) {
    return this.ventasService.update(id, ventaDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ventasService.remove(id);
  } */
}
