import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallesRecetaLentesAereos } from './entities/detalles-receta-lentes-aereos.entity';
import { CreateDetallesRecetaLentesAereosDTO } from './dto/create-detalles-receta-lentes-aereos.dto';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';

@Injectable()
export class DetallesRecetaLentesAereosService {
  constructor(
    @InjectRepository(DetallesRecetaLentesAereos)
    private detallesRepository: Repository<DetallesRecetaLentesAereos>,
    @InjectRepository(RecetaLentesAereos)
    private recetaRepository: Repository<RecetaLentesAereos>,
  ) {}

  async findAll(recetaId: number): Promise<DetallesRecetaLentesAereos[]> {
    try {
      return await this.detallesRepository.find({
        where: { recetaLentesAereos: { id: recetaId } },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los detalles de la receta: ' + error,
      );
    }
  }

  async findOne(
    recetaId: number,
    id: number,
  ): Promise<DetallesRecetaLentesAereos> {
    try {
      const detalle = await this.detallesRepository.findOne({
        where: {
          detalleId: id,
          recetaLentesAereos: { id: recetaId },
        },
        relations: ['recetaLentesAereos'],
      });

      return detalle;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el detalle de la receta: ' + error,
      );
    }
  }

  async create(
    recetaId: number,
    dto: CreateDetallesRecetaLentesAereosDTO,
  ): Promise<DetallesRecetaLentesAereos> {
    try {
      const receta = await this.recetaRepository.findOne({
        where: { id: recetaId },
      });

      if (!receta) {
        throw new NotFoundException(`Receta con id ${recetaId} no encontrada`);
      }

      const detalle = this.detallesRepository.create({
        ...dto,
        recetaLentesAereos: receta,
      });

      return await this.detallesRepository.save(detalle);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear el detalle de la receta: ' + error,
      );
    }
  }

  async update(
    recetaId: number,
    id: number,
    dto: CreateDetallesRecetaLentesAereosDTO,
  ): Promise<DetallesRecetaLentesAereos> {
    try {
      const detalle = await this.findOne(recetaId, id);
      const detalleActualizado = Object.assign(detalle, dto);

      return await this.detallesRepository.save(detalleActualizado);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el detalle de la receta: ' + error,
      );
    }
  }

  async remove(recetaId: number, id: number): Promise<void> {
    try {
      const detalle = await this.findOne(recetaId, id);

      await this.detallesRepository.remove(detalle);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar el detalle de la receta: ' + error,
      );
    }
  }
}
