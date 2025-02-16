import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { DetallesRecetaLentesAereosService } from './detalles-receta-lentes-aereos.service';
import { CreateDetallesRecetaLentesAereosDTO } from './dto/create-detalles-receta-lentes-aereos.dto';
import { DetallesRecetaLentesAereos } from './entities/detalles-receta-lentes-aereos.entity';

@Controller('receta-lentes-aereos/:recetaId/detalles')
export class DetallesRecetaLentesAereosController {
  constructor(
    private readonly detallesService: DetallesRecetaLentesAereosService,
  ) {}

  @Post()
  async create(
    @Param('recetaId') recetaId: number,
    @Body() createDto: CreateDetallesRecetaLentesAereosDTO,
  ): Promise<DetallesRecetaLentesAereos> {
    return this.detallesService.create(recetaId, createDto);
  }

  @Get()
  async findAll(
    @Param('recetaId') recetaId: number,
  ): Promise<DetallesRecetaLentesAereos[]> {
    return this.detallesService.findAll(recetaId);
  }

  @Get(':id')
  async findOne(
    @Param('recetaId') recetaId: number,
    @Param('id') id: number,
  ): Promise<DetallesRecetaLentesAereos> {
    return this.detallesService.findOne(recetaId, id);
  }

  @Put(':id')
  async update(
    @Param('recetaId') recetaId: number,
    @Param('id') id: number,
    @Body() updateDto: CreateDetallesRecetaLentesAereosDTO,
  ): Promise<DetallesRecetaLentesAereos> {
    return this.detallesService.update(recetaId, id, updateDto);
  }

  @Delete(':id')
  async remove(
    @Param('recetaId') recetaId: number,
    @Param('id') id: number,
  ): Promise<void> {
    return this.detallesService.remove(recetaId, id);
  }
}
