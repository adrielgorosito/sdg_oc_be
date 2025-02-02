import { ObraSocialService } from './obra-social.service';
import { CreateObraSocialDTO } from './dto/create-obra-social.dto';
import { UpdateObraSocialDTO } from './dto/update-obra-social.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('obra-social')
export class ObraSocialController {
  constructor(private readonly obraSocialService: ObraSocialService) {}

  @Get()
  async findAll() {
    return await this.obraSocialService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.obraSocialService.findOne(id);
  }

  @Post()
  async createOne(@Body() obraSocialDTO: CreateObraSocialDTO) {
    return await this.obraSocialService.create(obraSocialDTO);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() osDTO: UpdateObraSocialDTO) {
    return await this.obraSocialService.update(id, osDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.obraSocialService.remove(id);
  }
}
