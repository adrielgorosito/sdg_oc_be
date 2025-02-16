import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaLentesAereos } from './entities/receta-lentes-aereos.entity';
import { CreateRecetaLentesAereosDTO } from './dto/create-receta-lentes-aereos.dto';
import { UpdateRecetaLentesAereosDTO } from './dto/update-receta-lentes-aereos.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class RecetaLentesAereosService {
  constructor(
    @InjectRepository(RecetaLentesAereos)
    private rlaRepository: Repository<RecetaLentesAereos>,
  ) {}

  async findAll(): Promise<RecetaLentesAereos[]> {
    try {
      return await this.rlaRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las recetas de lentes aéreos: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<RecetaLentesAereos> {
    try {
      const receta = await this.rlaRepository.findOne({
        where: { id },
      });

      if (!receta) {
        throw new NotFoundException(
          `Receta de lentes aéreos con id ${id} no encontrada`,
        );
      }

      return receta;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la receta de lentes aéreos: ' + error,
      );
    }
  }

  async create(
    rlaDTO: CreateRecetaLentesAereosDTO,
  ): Promise<RecetaLentesAereos> {
    try {
      const receta = this.rlaRepository.create(rlaDTO);
      return await this.rlaRepository.save(receta);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la receta de lentes aéreos: ' + error,
      );
    }
  }

  async update(
    id: number,
    rlaDTO: UpdateRecetaLentesAereosDTO,
  ): Promise<RecetaLentesAereos> {
    try {
      const recetaExistente = await this.rlaRepository.findOne({
        where: { id },
      });

      if (!recetaExistente) {
        throw new NotFoundException(
          `Receta de lentes aéreos con id ${id} no encontrada`,
        );
      }

      const recetaActualizada = Object.assign(recetaExistente, rlaDTO);
      return await this.rlaRepository.save(recetaActualizada);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la receta de lentes aéreos: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const receta = await this.rlaRepository.findOne({ where: { id } });

      if (!receta) {
        throw new NotFoundException(
          `Receta de lentes aéreos con id ${id} no encontrada`,
        );
      }

      await this.rlaRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la receta de lentes aéreos: ' + error,
      );
    }
  }
}
