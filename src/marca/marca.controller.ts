import { MarcaService } from './marca.service';
import { CreateMarcaDTO } from './dto/create-marca.dto';
import { UpdateMarcaDTO } from './dto/update-marca.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('marca')
export class MarcasController {
  constructor(private readonly marcaService: MarcaService) {}

  @Get()
  findAll() {
    return this.marcaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.marcaService.findOne(id);
  }

  @Post()
  create(@Body() marcaDTO: CreateMarcaDTO) {
    return this.marcaService.create(marcaDTO);
  }

  @Patch(':id')
  updateOne(@Param('id') id: number, @Body() marcaDTO: UpdateMarcaDTO) {
    return this.marcaService.update(id, marcaDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.marcaService.remove(id);
  }
}
