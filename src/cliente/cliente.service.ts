import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Repository } from 'typeorm';
import { CreateClienteDTO } from './dto/create-cliente.dto';
import { UpdateClienteDTO } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async findAll() {
    try {
      const clientes = await this.clienteRepository.find({
        relations: {
          localidad: true,
        },
      });

      return clientes;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los clientes' + error,
      );
    }
  }

  async findOne(id: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id: Number(id) },
        relations: {
          localidad: true,
          clienteObrasSociales: true,
          cuentaCorriente: true,
          historiaClinicaLentesContacto: true,
          ventas: true,
          audiometrias: true,
          recetasLentesAereos: true,
          recetasLentesContacto: true,
        },
      });

      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      return cliente;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el cliente' + error,
      );
    }
  }

  async create(createClienteDto: CreateClienteDTO) {
    try {
      const cliente = this.clienteRepository.create(createClienteDto);
      cliente.cuentaCorriente = new CuentaCorriente();
      return await this.clienteRepository.save(cliente);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear el cliente' + error,
      );
    }
  }

  async update(id: number, updateClienteDto: UpdateClienteDTO) {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      Object.assign(clienteExistente, updateClienteDto);

      return await this.clienteRepository.save(clienteExistente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async remove(id: number) {
    try {
      const cliente = await this.findOne(id);

      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      return await this.clienteRepository.remove(cliente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }
}
