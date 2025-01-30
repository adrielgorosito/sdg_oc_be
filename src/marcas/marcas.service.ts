import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Marca } from './entities/marca.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMarcaDTO } from './dto/create-marca.dto';
import { UpdateMarcaDTO } from './dto/update-marca.dto';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  async findAll() {
    try {
      const marcas = await this.marcaRepository.find({
        order: {
          nombre: 'ASC',
        },
        relations: {
          productos: true,
        },
      });

      return marcas;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener las marcas');
    }
  }

  async findOne(id: number) {
    try {
      const marca = await this.marcaRepository.findOne({
        where: { id },
        relations: {
          productos: true,
        },
      });

      if (!marca) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }
      return marca;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la marca');
    }
  }

  async create(marca: CreateMarcaDTO): Promise<Marca> {
    try {
      const nuevaMarca = this.marcaRepository.create(marca);
      return this.marcaRepository.save(nuevaMarca);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear la marca');
    }
  }

  async update(id: number, marca: UpdateMarcaDTO): Promise<Marca> {
    try {
      const marcaExistente = await this.marcaRepository.findOne({
        where: { id },
      });
      if (!marcaExistente) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }
      Object.assign(marcaExistente, marca);
      return await this.marcaRepository.save(marcaExistente);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la marca');
    }
  }

  async remove(id: number) {
    try {
      const marca = await this.marcaRepository.findOne({ where: { id } });
      if (!marca) {
        throw new NotFoundException(`Marca con ID ${id} no encontrada`);
      }
      await this.marcaRepository.remove(marca);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la marca');
    }
  }
}
