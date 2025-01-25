import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraSocial } from './entities/obra-social.entity';
import { ObraSocialDTO } from './dto/obra-social.dto';

@Injectable()
export class ObraSocialService {
  constructor(
    @InjectRepository(ObraSocial)
    private obraSocialRepository: Repository<ObraSocial>,
  ) {}

  async findAll(): Promise<ObraSocial[]> {
    return await this.obraSocialRepository.find();
  }

  async findOne(id: number): Promise<ObraSocial> {
    return await this.obraSocialRepository.findOne({ where: { id: id } });
  }

  async create(obraSocialDTO: ObraSocialDTO): Promise<ObraSocial> {
    const obraSocialExists = await this.obraSocialRepository.findOne({
      where: { nombre: obraSocialDTO.nombre },
    });

    if (obraSocialExists) {
      throw new HttpException(
        'Ya existe una obra social con ese nombre',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nuevaObraSocial = this.obraSocialRepository.create(obraSocialDTO);
    return await this.obraSocialRepository.save(nuevaObraSocial);
  }

  async update(id: number, obraSocialDTO: ObraSocialDTO): Promise<ObraSocial> {
    const obraSocialToUpdate = await this.findOne(id);

    if (!obraSocialToUpdate) {
      throw new NotFoundException(`Obra social con id ${id} no encontrada`);
    }

    const nombreExists = await this.obraSocialRepository.findOne({
      where: { nombre: obraSocialDTO.nombre },
    });

    if (nombreExists) {
      throw new HttpException(
        'Ya existe una obra social con ese nombre',
        HttpStatus.BAD_REQUEST,
      );
    }

    const obraSocialUpdated = Object.assign(obraSocialToUpdate, obraSocialDTO);

    return await this.obraSocialRepository.save(obraSocialUpdated);
  }

  async delete(id: number): Promise<void> {
    const obraSocialToDelete = await this.findOne(id);

    if (!obraSocialToDelete) {
      throw new NotFoundException(`Obra social con id ${id} no encontrada`);
    }

    await this.obraSocialRepository.delete(id);
  }
}
