import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHistoriaClinicaLentesContactoDTO } from './dto/create-historia-clinica-lentes-contacto.dto';
import { UpdateHistoriaClinicaLentesContactoDTO } from './dto/update-historia-clinica-lentes-contacto.dto';
import { HistoriaClinicaLentesContacto } from './entities/historia-clinica-lentes-contacto.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class HistoriaClinicaLentesContactoService {
  constructor(
    @InjectRepository(HistoriaClinicaLentesContacto)
    private hclcRepository: Repository<HistoriaClinicaLentesContacto>,

    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async findAll() {
    try {
      return await this.hclcRepository.find({
        relations: {
          cliente: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las historias clínicas de lentes de contacto: ' +
          error,
      );
    }
  }

  async findOne(id: number): Promise<HistoriaClinicaLentesContacto> {
    try {
      const hclc = await this.hclcRepository.findOne({
        where: { id },
        relations: {
          cliente: true,
        },
      });

      if (!hclc) {
        throw new NotFoundException(
          `Historia clínica de lentes de contactos con id ${id} no encontrada`,
        );
      }

      return hclc;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la historia clínica de lentes de contacto: ' + error,
      );
    }
  }

  async create(
    hclcDTO: CreateHistoriaClinicaLentesContactoDTO,
  ): Promise<HistoriaClinicaLentesContacto> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: hclcDTO.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(
          `Cliente con id ${hclcDTO.cliente.id} no encontrado`,
        );
      }

      const hclc = this.hclcRepository.create(hclcDTO);
      return await this.hclcRepository.save(hclc);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al crear la historia clínica de lentes de contacto: ' + error,
      );
    }
  }

  async update(id: number, hclcDTO: UpdateHistoriaClinicaLentesContactoDTO) {
    try {
      const hclcExistente = await this.hclcRepository.findOne({
        where: { id },
      });

      if (!hclcExistente) {
        throw new NotFoundException(
          `Historia clínica de lentes de contacto con id ${id} no encontrada`,
        );
      }

      Object.assign(hclcExistente, hclcDTO);
      return await this.hclcRepository.save(hclcExistente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al actualizar la historia clínica de lentes de contacto: ' +
          error,
      );
    }
  }

  async remove(id: number) {
    try {
      const hclc = await this.hclcRepository.findOne({
        where: { id },
      });

      if (!hclc) {
        throw new NotFoundException(
          `Historia clínica de lentes de contacto con id ${id} no encontrada`,
        );
      }

      await this.hclcRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al actualizar la historia clínica de lentes de contacto: ' +
          error,
      );
    }
  }
}
