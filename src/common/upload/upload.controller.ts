import { Controller, Get, Param } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get(':tipo/:nombre')
  async findOne(
    @Param('tipo') tipo: string,
    @Param('nombre') nombreArchivo: string,
  ) {
    return await this.uploadService.findOne(tipo, nombreArchivo);
  }
}
