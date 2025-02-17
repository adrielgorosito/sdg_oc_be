import { Controller, Get, Param } from '@nestjs/common';
import { ProvinciaService } from './provincia.service';

@Controller('provincias')
export class ProvinciaController {
  constructor(private readonly provinciaService: ProvinciaService) {}

  @Get()
  async findAll() {
    return this.provinciaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.provinciaService.findOne(id);
  }
}
