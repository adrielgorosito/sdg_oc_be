import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor() {}

  async findOne(tipo: string, url: string) {
    try {
      const filePath = join(process.cwd(), 'uploads', tipo, url);
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Archivo no encontrado');
      }
      return filePath;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el archivo: ' + error.message,
      );
    }
  }
}
