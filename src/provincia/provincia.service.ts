import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provincia } from './entities/provincia.entity';

@Injectable()
export class ProvinciaService {
  constructor(
    @InjectRepository(Provincia)
    private readonly provinciaRepository: Repository<Provincia>,
  ) {}

  async findAll(): Promise<Provincia[]> {
    return this.provinciaRepository.find({
      relations: ['localidades'],
    });
  }

  async findOne(id: number): Promise<Provincia> {
    const provincia = await this.provinciaRepository.findOne({
      where: { id },
      relations: ['localidades'],
    });

    if (!provincia) {
      throw new NotFoundException(`Provincia con id ${id} no encontrada`);
    }

    return provincia;
  }
}
