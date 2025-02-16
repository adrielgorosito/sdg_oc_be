import { RecetaLentesAereosService } from './receta-lentes-aereos.service';
import { CreateRecetaLentesAereosDTO } from './dto/create-receta-lentes-aereos.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UpdateRecetaLentesAereosDTO } from './dto/update-receta-lentes-aereos.dto';

@Controller('receta-lentes-aereos')
export class RecetaLentesAereosController {
  constructor(private readonly rlaService: RecetaLentesAereosService) {}

  @Get()
  async findAll() {
    return await this.rlaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.rlaService.findOne(id);
  }

  @Post()
  async createOne(@Body() rlaDTO: CreateRecetaLentesAereosDTO) {
    return await this.rlaService.create(rlaDTO);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() rlaDTO: UpdateRecetaLentesAereosDTO,
  ) {
    return await this.rlaService.update(id, rlaDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.rlaService.remove(id);
  }
}
