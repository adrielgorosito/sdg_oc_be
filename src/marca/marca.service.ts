import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from './entities/marca.entity';
import { CreateMarcaDTO } from './dto/create-marca.dto';
import { UpdateMarcaDTO } from './dto/update-marca.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class MarcaService {
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
      throw new InternalServerErrorException(
        'Error al obtener las marcas: ' + error,
      );
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
        throw new NotFoundException(`Marca con id ${id} no encontrada`);
      }

      return marca;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la marca: ' + error,
      );
    }
  }

  async create(marca: CreateMarcaDTO): Promise<Marca> {
    try {
      const marcaExistente = await this.marcaRepository.findOne({
        where: { nombre: marca.nombre },
      });

      if (marcaExistente) {
        throw new HttpException(
          'Ya existe una marca con ese nombre',
          HttpStatus.BAD_REQUEST,
        );
      }

      const nuevaMarca = this.marcaRepository.create(marca);
      return this.marcaRepository.save(nuevaMarca);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la marca: ' + error,
      );
    }
  }

  async update(id: number, marca: UpdateMarcaDTO): Promise<Marca> {
    try {
      const marcaExistente = await this.marcaRepository.findOne({
        where: { id },
      });

      if (!marcaExistente) {
        throw new NotFoundException(`Marca con id ${id} no encontrada`);
      }

      Object.assign(marcaExistente, marca);
      return await this.marcaRepository.save(marcaExistente);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la marca: ' + error,
      );
    }
  }

  async remove(id: number) {
    try {
      const marca = await this.marcaRepository.findOne({ where: { id } });

      if (!marca) {
        throw new NotFoundException(`Marca con id ${id} no encontrada`);
      }

      await this.marcaRepository.remove(marca);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la marca: ' + error,
      );
    }
  }
}
