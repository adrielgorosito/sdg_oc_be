import { RecetaLentesContactoService } from './receta-lentes-contacto.service';
import { CreateRecetaLentesContactoDTO } from './dto/create-receta-lentes-contacto.dto';
import { UpdateRecetaLentesContactoDTO } from './dto/update-receta-lentes-contacto.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';

@Controller('receta-lentes-contacto')
export class RecetaLentesContactoController {
  constructor(private readonly rlcService: RecetaLentesContactoService) {}

  @Get()
  async findAll() {
    return await this.rlcService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.rlcService.findOne(id);
  }

  @Post()
  async create(
    @Body()
    rlcDTO: CreateRecetaLentesContactoDTO,
  ) {
    return await this.rlcService.create(rlcDTO);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body()
    rlcDTO: UpdateRecetaLentesContactoDTO,
  ) {
    return await this.rlcService.update(id, rlcDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.rlcService.remove(id);
  }
}
