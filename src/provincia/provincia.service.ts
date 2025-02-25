import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProvinciaService {
  constructor(
    @InjectRepository(Provincia)
    private readonly provinciaRepository: Repository<Provincia>,
  ) {}

  async findAll(): Promise<Provincia[]> {
    try {
      return this.provinciaRepository.find({
        relations: ['localidades'],
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener las provincias: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<Provincia> {
    try {
      const provincia = await this.provinciaRepository.findOne({
        where: { id },
        relations: ['localidades'],
      });

      if (!provincia) {
        throw new NotFoundException(`Provincia con id ${id} no encontrada`);
      }

      return provincia;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la provincia: ' + error,
      );
    }
  }
}
