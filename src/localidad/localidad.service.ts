import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Localidad } from './entities/localidad.entity';

@Injectable()
export class LocalidadService {
  constructor(
    @InjectRepository(Localidad)
    private readonly localidadRepository: Repository<Localidad>,
  ) {}

  async findAll(): Promise<Localidad[]> {
    return this.localidadRepository.find({
      relations: ['provincia'],
    });
  }

  async findOne(id: number): Promise<Localidad> {
    const localidad = await this.localidadRepository.findOne({
      where: { id },
      relations: ['provincia'],
    });

    if (!localidad) {
      throw new NotFoundException(`Localidad con id ${id} no encontrada`);
    }

    return localidad;
  }
}
