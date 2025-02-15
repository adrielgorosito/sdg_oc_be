import { AudiometriaService } from './audiometria.service';
import { CreateAudiometriaDTO } from './dto/create-audiometria.dto';
import { UpdateAudiometriaDTO } from './dto/update-audiometria.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('audiometria')
export class AudiometriaController {
  constructor(private readonly audiometriaService: AudiometriaService) {}

  @Get()
  async findAll() {
    return await this.audiometriaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.audiometriaService.findOne(id);
  }

  @Post()
  async createOne(@Body() audiometriaDTO: CreateAudiometriaDTO) {
    return await this.audiometriaService.create(audiometriaDTO);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() audiometriaDTO: UpdateAudiometriaDTO,
  ) {
    return await this.audiometriaService.update(id, audiometriaDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.audiometriaService.remove(id);
  }
}
