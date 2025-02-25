import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localidad } from './entities/localidad.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class LocalidadService {
  constructor(
    @InjectRepository(Localidad)
    private readonly localidadRepository: Repository<Localidad>,
  ) {}

  async findAll(): Promise<Localidad[]> {
    try {
      return this.localidadRepository.find({
        relations: ['provincia'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las localidades: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<Localidad> {
    try {
      const localidad = await this.localidadRepository.findOne({
        where: { id },
        relations: ['provincia'],
      });

      if (!localidad) {
        throw new NotFoundException(`Localidad con id ${id} no encontrada`);
      }

      return localidad;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la localidad: ' + error,
      );
    }
  }
}
