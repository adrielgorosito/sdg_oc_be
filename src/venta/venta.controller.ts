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
  async findAll(@Query() paginateVentaDTO: PaginateVentaDTO) {
    return this.ventaService.findAll(paginateVentaDTO);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ventaService.findOne(id);
  }

  @Post()
  async create(@Body() ventaDTO: CreateVentaDTO) {
    return this.ventaService.create(ventaDTO);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() ventaDTO: UpdateVentaDTO) {
    return this.ventaService.update(id, ventaDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ventaService.remove(id);
  }
}
