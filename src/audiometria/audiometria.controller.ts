import { FileInterceptor } from '@nestjs/platform-express';
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
  UploadedFile,
  UseInterceptors,
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
  @UseInterceptors(FileInterceptor('pdf'))
  async create(
    @Body('audiometriaDTO') audiometriaDTOString: string,
    @UploadedFile() pdf: Express.Multer.File,
  ) {
    const audiometriaDTO: CreateAudiometriaDTO =
      JSON.parse(audiometriaDTOString);
    return await this.audiometriaService.create(audiometriaDTO, pdf);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('pdf'))
  async update(
    @Param('id') id: number,
    @Body('audiometriaDTO') audiometriaDTOString: string,
    @UploadedFile() pdf?: Express.Multer.File,
  ) {
    const audiometriaDTO: UpdateAudiometriaDTO =
      JSON.parse(audiometriaDTOString);
    return await this.audiometriaService.update(id, audiometriaDTO, pdf);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.audiometriaService.remove(id);
  }
}
