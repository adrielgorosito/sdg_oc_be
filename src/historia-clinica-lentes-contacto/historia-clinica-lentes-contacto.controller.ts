import { HistoriaClinicaLentesContactoService } from './historia-clinica-lentes-contacto.service';
import { CreateHistoriaClinicaLentesContactoDTO } from './dto/create-historia-clinica-lentes-contacto.dto';
import { UpdateHistoriaClinicaLentesContactoDTO } from './dto/update-historia-clinica-lentes-contacto.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('historia-clinica-lentes-contacto')
export class HistoriaClinicaLentesContactoController {
  constructor(
    private readonly hclcService: HistoriaClinicaLentesContactoService,
  ) {}

  @Get()
  async findAll() {
    return await this.hclcService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.hclcService.findOne(id);
  }

  @Post()
  async createOne(
    @Body()
    hclcDTO: CreateHistoriaClinicaLentesContactoDTO,
  ) {
    return await this.hclcService.create(hclcDTO);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    hclcDTO: UpdateHistoriaClinicaLentesContactoDTO,
  ) {
    return await this.hclcService.update(id, hclcDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.hclcService.remove(id);
  }
}
