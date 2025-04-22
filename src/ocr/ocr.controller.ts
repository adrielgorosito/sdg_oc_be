import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('processImage1')
  @UseInterceptors(FileInterceptor('image'))
  async processImage1(@UploadedFile() file: Express.Multer.File) {
    return this.ocrService.processImage1(file.buffer);
  }

  @Post('processImage2')
  @UseInterceptors(FileInterceptor('image'))
  async processImage2(@UploadedFile() file: Express.Multer.File) {
    return this.ocrService.processImage2(file.buffer);
  }
}
