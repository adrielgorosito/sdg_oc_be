import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audiometria } from './entities/audiometria.entity';
import { CreateAudiometriaDTO } from './dto/create-audiometria.dto';
import { UpdateAudiometriaDTO } from './dto/update-audiometria.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AudiometriaService {
  constructor(
    @InjectRepository(Audiometria)
    private audiometriaRepository: Repository<Audiometria>,
  ) {}

  async findAll(): Promise<Audiometria[]> {
    try {
      return await this.audiometriaRepository.find({
        relations: { cliente: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las audiometrías: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<Audiometria> {
    try {
      const audiometria = await this.audiometriaRepository.findOne({
        where: { id },
        relations: { cliente: true },
      });

      if (!audiometria) {
        throw new NotFoundException(`Audiometría con id ${id} no encontrada`);
      }

      return audiometria;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la audiometría: ' + error,
      );
    }
  }

  async create(audiometriaDTO: CreateAudiometriaDTO): Promise<Audiometria> {
    try {
      const audiometria = this.audiometriaRepository.create(audiometriaDTO);
      return await this.audiometriaRepository.save(audiometria);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la audiometría: ' + error,
      );
    }
  }

  async update(
    id: number,
    audiometriaDTO: UpdateAudiometriaDTO,
  ): Promise<Audiometria> {
    try {
      const audiometriaExistente = await this.audiometriaRepository.findOne({
        where: { id },
      });

      if (!audiometriaExistente) {
        throw new NotFoundException(`Audiometría con id ${id} no encontrada`);
      }

      const audiometriaActualizada = Object.assign(
        audiometriaExistente,
        audiometriaDTO,
      );
      return await this.audiometriaRepository.save(audiometriaActualizada);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la audiometría: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const audiometria = await this.audiometriaRepository.findOne({
        where: { id },
      });

      if (!audiometria) {
        throw new NotFoundException(`Audiometría con id ${id} no encontrada`);
      }

      await this.audiometriaRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la audiometría: ' + error,
      );
    }
  }
}
