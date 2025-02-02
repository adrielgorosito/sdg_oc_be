import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaCorriente } from './entities/cuenta-corriente.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CreateCuentaCorrienteDTO } from './dto/create-cuenta-corriente.dto';
import { UpdateCuentaCorrienteDTO } from './dto/update-cuenta-corriente.dto';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CuentaCorrienteService {
  constructor(
    @InjectRepository(CuentaCorriente)
    private cuentaCorrienteRepository: Repository<CuentaCorriente>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(): Promise<CuentaCorriente[]> {
    try {
      return await this.cuentaCorrienteRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las cuentas corrientes: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<CuentaCorriente> {
    try {
      const cuentaCorriente = await this.cuentaCorrienteRepository.findOne({
        where: { id },
      });

      if (!cuentaCorriente) {
        throw new NotFoundException(
          `Cuenta corriente con id ${id} no encontrada`,
        );
      }

      return cuentaCorriente;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la cuenta corriente: ' + error,
      );
    }
  }

  async create(ccDTO: CreateCuentaCorrienteDTO): Promise<CuentaCorriente> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: ccDTO.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(
          `Cliente con id ${ccDTO.cliente.id} no encontrado`,
        );
      }

      const cuentaCorriente = this.cuentaCorrienteRepository.create(ccDTO);
      return await this.cuentaCorrienteRepository.save(cuentaCorriente);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la cuenta corriente: ' + error,
      );
    }
  }

  async update(
    id: number,
    ccDTO: UpdateCuentaCorrienteDTO,
  ): Promise<CuentaCorriente> {
    try {
      const ccExistente = await this.cuentaCorrienteRepository.findOne({
        where: { id },
      });

      if (!ccExistente) {
        throw new NotFoundException(
          `Cuenta corriente con id ${id} no encontrada`,
        );
      }

      const ccActualizado = Object.assign(ccExistente, ccDTO);
      return await this.cuentaCorrienteRepository.save(ccActualizado);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la cuenta corriente: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const cuentaCorriente = await this.cuentaCorrienteRepository.findOne({
        where: { id },
      });

      if (!cuentaCorriente) {
        throw new NotFoundException(
          `Cuenta corriente con id ${id} no encontrada`,
        );
      }

      await this.cuentaCorrienteRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la cuenta corriente: ' + error,
      );
    }
  }
}
