import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { CreateMarcaDTO } from './dto/create-marca.dto';
import { UpdateMarcaDTO } from './dto/update-marca.dto';

@Controller('marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.marcasService.findOne(id);
  }

  @Post()
  create(@Body() marcaDTO: CreateMarcaDTO) {
    return this.marcasService.create(marcaDTO);
  }

  @Patch(':id')
  updateOne(@Param('id') id: number, @Body() marcaDTO: UpdateMarcaDTO) {
    return this.marcasService.update(id, marcaDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.marcasService.remove(id);
  }
}
