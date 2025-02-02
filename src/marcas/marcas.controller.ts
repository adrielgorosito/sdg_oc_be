import { MarcasService } from './marcas.service';
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

@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Get()
  async findAll() {
    return await this.marcasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.marcasService.findOne(id);
  }

  @Post()
  async create(@Body() marcaDTO: CreateMarcaDTO) {
    return await this.marcasService.create(marcaDTO);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() marcaDTO: UpdateMarcaDTO) {
    return await this.marcasService.update(id, marcaDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.marcasService.remove(id);
  }
}
