import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateVentaDTO } from './dto/create-venta.dto';
import { UpdateVentaDTO } from './dto/update-venta.dto';
import { VentaService } from './venta.service';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Get()
  findAll() {
    return this.ventaService.findAll();
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

  @Get('cliente/:id')
  findByCliente(@Param('id') id: number) {
    return this.ventaService.findByCliente(id);
  }
  @Get('cliente/dni/:dni')
  findByClienteDni(@Param('dni') dni: number) {
    return this.ventaService.findByClienteDni(dni);
  }
}
