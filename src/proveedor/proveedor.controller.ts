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
  async findAll() {
    return await this.proveedorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.proveedorService.findOne(id);
  }

  @Post()
  async create(@Body() proveedorDTO: CreateProveedorDTO) {
    return await this.proveedorService.create(proveedorDTO);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() proveedorDTO: UpdateProveedorDTO,
  ) {
    return await this.proveedorService.update(id, proveedorDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.proveedorService.remove(id);
  }
}
