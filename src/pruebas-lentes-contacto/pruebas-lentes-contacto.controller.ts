import { PruebasLentesContactoService } from './pruebas-lentes-contacto.service';
import { CreatePruebasLentesContactoDTO } from './dto/create-pruebas-lentes-contacto.dto';
import { UpdatePruebasLentesContactoDTO } from './dto/update-pruebas-lentes-contacto.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('pruebas-lentes-contacto')
export class PruebasLentesContactoController {
  constructor(private readonly plcService: PruebasLentesContactoService) {}

  @Get()
  async findAll() {
    return await this.plcService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.plcService.findOne(id);
  }

  @Post()
  async createOne(
    @Body()
    plcDTO: CreatePruebasLentesContactoDTO,
  ) {
    return await this.plcService.create(plcDTO);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    plcDTO: UpdatePruebasLentesContactoDTO,
  ) {
    return await this.plcService.update(id, plcDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.plcService.remove(id);
  }
}
