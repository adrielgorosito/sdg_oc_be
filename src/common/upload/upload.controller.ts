import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get(':tipo/:nombre')
  async findOne(
    @Param('tipo') tipo: string,
    @Param('nombre') nombreArchivo: string,
    @Res() res: Response,
  ) {
    const filePath = await this.uploadService.findOne(tipo, nombreArchivo);

    res.sendFile(filePath);
  }
}
