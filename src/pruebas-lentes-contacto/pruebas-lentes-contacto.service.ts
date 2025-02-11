import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PruebasLentesContacto } from './entities/pruebas-lentes-contacto.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';
import { CreatePruebasLentesContactoDTO } from './dto/create-pruebas-lentes-contacto.dto';
import { UpdatePruebasLentesContactoDTO } from './dto/update-pruebas-lentes-contacto.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class PruebasLentesContactoService {
  constructor(
    @InjectRepository(PruebasLentesContacto)
    private plcRepository: Repository<PruebasLentesContacto>,

    @InjectRepository(RecetaLentesContacto)
    private recetaLentesContactoRepository: Repository<RecetaLentesContacto>,
  ) {}

  async findAll(): Promise<PruebasLentesContacto[]> {
    try {
      return await this.plcRepository.find({
        relations: {
          recetaLentesContacto: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las pruebas de lentes de contacto: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<PruebasLentesContacto> {
    try {
      const prueba = await this.plcRepository.findOne({
        where: { id },
        relations: {
          recetaLentesContacto: true,
        },
      });

      if (!prueba) {
        throw new NotFoundException(
          `Prueba de lentes de contacto con id ${id} no encontrada`,
        );
      }

      return prueba;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la prueba de lentes de contacto: ' + error,
      );
    }
  }

  async create(
    plcDTO: CreatePruebasLentesContactoDTO,
  ): Promise<PruebasLentesContacto> {
    try {
      const recetaExistente = await this.recetaLentesContactoRepository.findOne(
        {
          where: { id: plcDTO.recetaLentesContacto.id },
        },
      );

      if (!recetaExistente) {
        throw new NotFoundException(
          `Receta de lentes de contacto con id ${plcDTO.recetaLentesContacto.id} no encontrada`,
        );
      }

      const prueba = this.plcRepository.create(plcDTO);
      return await this.plcRepository.save(prueba);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la prueba de lentes de contacto: ' + error,
      );
    }
  }

  async update(
    id: number,
    plcDTO: UpdatePruebasLentesContactoDTO,
  ): Promise<PruebasLentesContacto> {
    try {
      const pruebaExistente = await this.plcRepository.findOne({
        where: { id },
      });

      if (!pruebaExistente) {
        throw new NotFoundException(
          `Prueba de lentes de contacto con id ${id} no encontrada`,
        );
      }

      if (
        plcDTO.numeroPrueba !== undefined &&
        plcDTO.numeroPrueba !== pruebaExistente.numeroPrueba
      ) {
        throw new InternalServerErrorException(
          `No se permite modificar el numeroPrueba`,
        );
      }

      const pruebaActualizada = Object.assign(pruebaExistente, plcDTO);
      return await this.plcRepository.save(pruebaActualizada);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la prueba de lentes de contacto: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const prueba = await this.plcRepository.findOne({
        where: { id },
      });

      if (!prueba) {
        throw new NotFoundException(
          `Prueba de lentes de contacto con id ${id} no encontrada`,
        );
      }

      await this.plcRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la prueba de lentes de contacto: ' + error,
      );
    }
  }
}
