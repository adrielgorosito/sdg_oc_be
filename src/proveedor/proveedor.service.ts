import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { CreateProveedorDTO } from './dto/create-proveedor.dto';
import { UpdateProveedorDTO } from './dto/update-proveedor.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProveedorService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  async findAll(): Promise<Proveedor[]> {
    try {
      return await this.proveedorRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los proveedores: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<Proveedor> {
    try {
      const proveedor = await this.proveedorRepository.findOne({
        where: { id },
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      }

      return proveedor;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el proveedor: ' + error);
    }
  }

  async create(proveedor: CreateProveedorDTO): Promise<Proveedor> {
    try {
      const nuevoProveedor = this.proveedorRepository.create(proveedor);
      return await this.proveedorRepository.save(nuevoProveedor);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear el proveedor: ' + error,
      );
    }
  }

  async update(id: number, proveedor: UpdateProveedorDTO): Promise<Proveedor> {
    try {
      const proveedorExistente = await this.proveedorRepository.findOne({
        where: { id },
      });
      
      if (!proveedorExistente) {
        throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      }
      
      const c = Object.assign(proveedorExistente, proveedor);
      return await this.proveedorRepository.save(c);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el proveedor: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const proveedor = await this.proveedorRepository.findOne({
        where: { id },
      });
      
      if (!proveedor) {
        throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
      }
      
      await this.proveedorRepository.remove(proveedor);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el proveedor: ' + error);
    }
  }
}
