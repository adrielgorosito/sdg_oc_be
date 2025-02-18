import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateRecetaLentesAereosDTO } from './dto/create-receta-lentes-aereos.dto';
import { UpdateRecetaLentesAereosDTO } from './dto/update-receta-lentes-aereos.dto';
import { RecetaLentesAereos } from './entities/receta-lentes-aereos.entity';
@Injectable()
export class RecetaLentesAereosService {
  constructor(
    @InjectRepository(RecetaLentesAereos)
    private rlaRepository: Repository<RecetaLentesAereos>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
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
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Error al obtener la receta de lentes aéreos: ' + error,
      );
    }
  }

  async create(
    rlaDTO: CreateRecetaLentesAereosDTO,
  ): Promise<RecetaLentesAereos> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: rlaDTO.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(
          `Cliente con id ${rlaDTO.cliente.id} no encontrado`,
        );
      }
      const receta = this.rlaRepository.create(rlaDTO);
      return await this.rlaRepository.save(receta);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

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
      if (error instanceof NotFoundException) throw error;

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
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Error al eliminar la receta de lentes aéreos: ' + error,
      );
    }
  }
}
