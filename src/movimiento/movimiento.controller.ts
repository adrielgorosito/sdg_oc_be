import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MovimientoService } from './movimiento.service';
import { CreateMovimientoDTO } from './dto/create-movimiento.dto';
import { UpdateMovimientoDTO } from './dto/update-movimiento.dto';

@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}

  @Get()
  async findAll() {
    return await this.movimientoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.movimientoService.findOne(id);
  }

  @Post()
  async create(@Body() movDTO: CreateMovimientoDTO) {
    return await this.movimientoService.create(movDTO);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() movDTO: UpdateMovimientoDTO) {
    return await this.movimientoService.update(id, movDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.movimientoService.remove(id);
  }
}
