import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CuentaCorriente } from './entities/cuenta-corriente.entity';
import { Repository } from 'typeorm';
import { CuentaCorrienteDTO } from './dto/cuenta-corriente.dto';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Injectable()
export class CuentaCorrienteService {
  constructor(
    @InjectRepository(CuentaCorriente)
    private cuentaCorrienteRepository: Repository<CuentaCorriente>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(): Promise<CuentaCorriente[]> {
    return await this.cuentaCorrienteRepository.find();
  }

  async findOne(id: number): Promise<CuentaCorriente> {
    return await this.cuentaCorrienteRepository.findOne({ where: { id: id } });
  }

  async create(ccDTO: CuentaCorrienteDTO): Promise<CuentaCorriente> {
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
  }

  async update(id: number, newSaldo: number): Promise<CuentaCorriente> {
    const ccToUpdate = await this.findOne(id);

    if (!ccToUpdate) {
      throw new NotFoundException(
        `Cuenta corriente con id ${id} no encontrada`,
      );
    }

    ccToUpdate.saldo = newSaldo;

    return await this.cuentaCorrienteRepository.save(ccToUpdate);
  }

  async delete(id: number): Promise<void> {
    const cuentaCorriente = await this.findOne(id);

    if (!cuentaCorriente) {
      throw new NotFoundException(
        `Cuenta corriente con id ${id} no encontrada`,
      );
    }

    await this.cuentaCorrienteRepository.delete(id);
  }
}
