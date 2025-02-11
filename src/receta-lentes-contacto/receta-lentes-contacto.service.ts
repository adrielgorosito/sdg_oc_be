import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaLentesContacto } from './entities/receta-lentes-contacto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CreateRecetaLentesContactoDTO } from './dto/create-receta-lentes-contacto.dto';
import { UpdateRecetaLentesContactoDTO } from './dto/update-receta-lentes-contacto.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class RecetaLentesContactoService {
  constructor(
    @InjectRepository(RecetaLentesContacto)
    private rlcRepository: Repository<RecetaLentesContacto>,

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(): Promise<RecetaLentesContacto[]> {
    try {
      return await this.rlcRepository.find({
        relations: {
          cliente: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las recetas de lentes de contacto: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<RecetaLentesContacto> {
    try {
      const receta = await this.rlcRepository.findOne({
        where: { id },
        relations: {
          cliente: true,
        },
      });

      if (!receta) {
        throw new NotFoundException(
          `Receta de lentes de contacto con id ${id} no encontrada`,
        );
      }

      return receta;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la receta de lentes de contacto: ' + error,
      );
    }
  }

  async create(
    rlcDTO: CreateRecetaLentesContactoDTO,
  ): Promise<RecetaLentesContacto> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: rlcDTO.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(
          `Cliente con id ${rlcDTO.cliente.id} no encontrado`,
        );
      }

      const receta = this.rlcRepository.create(rlcDTO);

      return await this.rlcRepository.save(receta);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la receta de lentes de contacto: ' + error,
      );
    }
  }

  async update(
    id: number,
    rlcDTO: UpdateRecetaLentesContactoDTO,
  ): Promise<RecetaLentesContacto> {
    try {
      const recetaExistente = await this.rlcRepository.findOne({
        where: { id },
      });

      if (!recetaExistente) {
        throw new NotFoundException(
          `Receta de lentes de contacto con id ${id} no encontrada`,
        );
      }

      const recetaActualizada = Object.assign(recetaExistente, rlcDTO);
      return await this.rlcRepository.save(recetaActualizada);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la receta de lentes de contacto: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const receta = await this.rlcRepository.findOne({
        where: { id },
      });

      if (!receta) {
        throw new NotFoundException(
          `Receta de lentes de contacto con id ${id} no encontrada`,
        );
      }

      await this.rlcRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la receta de lentes de contacto: ' + error,
      );
    }
  }
}
