import { Controller, Get, Param } from '@nestjs/common';
import { LocalidadService } from './localidad.service';

@Controller('localidades')
export class LocalidadController {
  constructor(private readonly localidadService: LocalidadService) {}

  @Get()
  async findAll() {
    return this.localidadService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.localidadService.findOne(id);
  }
}
