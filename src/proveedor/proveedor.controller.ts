import { ProveedorService } from './proveedor.service';
import { CreateProveedorDTO } from './dto/create-proveedor.dto';
import { UpdateProveedorDTO } from './dto/update-proveedor.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('proveedores')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Get()
  findAll() {
    return this.proveedorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.proveedorService.findOne(id);
  }

  @Post()
  create(@Body() proveedorDTO: CreateProveedorDTO) {
    return this.proveedorService.create(proveedorDTO);
  }

  @Patch(':id')
  updateOne(@Param('id') id: number, @Body() proveedorDTO: UpdateProveedorDTO) {
    return this.proveedorService.update(id, proveedorDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.proveedorService.remove(id);
  }
}
