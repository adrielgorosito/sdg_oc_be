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
import { CreateVentaDTO } from './dto/create-venta.dto';
import { PaginateVentaDTO } from './dto/paginate-venta.dto';
import { UpdateVentaDTO } from './dto/update-venta.dto';
import { VentaService } from './venta.service';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Get()
  findAll(@Query() paginateVentaDTO: PaginateVentaDTO) {
    return this.ventaService.findAll(paginateVentaDTO);
  }

  @Post()
  createOne(@Body() ventaDTO: CreateVentaDTO) {
    return this.ventaService.create(ventaDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventaService.findOne(id);
  }

  @Patch(':id')
  updateOne(@Param('id') id: string, @Body() ventaDTO: UpdateVentaDTO) {
    return this.ventaService.update(id, ventaDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventaService.remove(id);
  }
}
