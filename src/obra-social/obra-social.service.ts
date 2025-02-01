import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraSocial } from './entities/obra-social.entity';
import { CreateObraSocialDTO } from './dto/create-obra-social.dto';
import { UpdateObraSocialDTO } from './dto/update-obra-social.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ObraSocialService {
  constructor(
    @InjectRepository(ObraSocial)
    private obraSocialRepository: Repository<ObraSocial>,
  ) {}

  async findAll(): Promise<ObraSocial[]> {
    try {
      return await this.obraSocialRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las obras sociales: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<ObraSocial> {
    try {
      const obraSocial = await this.obraSocialRepository.findOne({
        where: { id },
      });

      if (!obraSocial) {
        throw new NotFoundException(`Obra social con id ${id} no encontrada`);
      }

      return obraSocial;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la obra social: ' + error,
      );
    }
  }

  async create(obraSocial: CreateObraSocialDTO): Promise<ObraSocial> {
    try {
      const obraSocialExistente = await this.obraSocialRepository.findOne({
        where: { nombre: obraSocial.nombre },
      });

      if (obraSocialExistente) {
        throw new HttpException(
          'Ya existe una obra social con ese nombre',
          HttpStatus.BAD_REQUEST,
        );
      }

      const nuevaObraSocial = this.obraSocialRepository.create(obraSocial);
      return await this.obraSocialRepository.save(nuevaObraSocial);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la obra social: ' + error,
      );
    }
  }

  async update(
    id: number,
    obraSocial: UpdateObraSocialDTO,
  ): Promise<ObraSocial> {
    try {
      const obraSocialExistente = await this.obraSocialRepository.findOne({
        where: { id },
      });

      if (!obraSocialExistente) {
        throw new NotFoundException(`Obra social con id ${id} no encontrada`);
      }

      const nombreExistente = await this.obraSocialRepository.findOne({
        where: { nombre: obraSocial.nombre },
      });

      if (nombreExistente) {
        throw new HttpException(
          'Ya existe una obra social con ese nombre',
          HttpStatus.BAD_REQUEST,
        );
      }

      const osActualizada = Object.assign(obraSocialExistente, obraSocial);
      return await this.obraSocialRepository.save(osActualizada);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la obra social: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const obraSocial = await this.obraSocialRepository.findOne({
        where: { id },
      });

      if (!obraSocial) {
        throw new NotFoundException(`Obra social con id ${id} no encontrada`);
      }

      await this.obraSocialRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la obra social: ' + error,
      );
    }
  }
}
