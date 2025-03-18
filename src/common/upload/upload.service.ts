import { promises as fs } from 'fs';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class UploadService {
  constructor() {}

  async findOne(tipo: string, url: string) {
    try {
      const uploadDir = join(process.cwd(), 'uploads', tipo, url + '.pdf');
      const archivo = await fs.readFile(uploadDir);

      return archivo;
    } catch (error) {
      if (error.code === 'ENOENT')
        throw new NotFoundException('Archivo no encontrado');
      throw new InternalServerErrorException(
        'Error al obtener el archivo: ' + error,
      );
    }
  }
}
