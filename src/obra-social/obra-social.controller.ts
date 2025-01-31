import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ObraSocialService } from './obra-social.service';
import { ObraSocialDTO } from './dto/obra-social.dto';

@Controller('obra-social')
export class ObraSocialController {
  constructor(private readonly obraSocialService: ObraSocialService) {}

  @Get()
  async findAll() {
    return await this.obraSocialService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.obraSocialService.findOne(id);
  }

  @Post()
  async createOne(@Body() obraSocialDTO: ObraSocialDTO) {
    return await this.obraSocialService.create(obraSocialDTO);
  }

  @Patch('/:id')
  async update(@Param('id') id: number, @Body() obraSocialDTO: ObraSocialDTO) {
    return await this.obraSocialService.update(id, obraSocialDTO);
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: number) {
    return await this.obraSocialService.delete(id);
  }
}
