import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { TipoMovimiento } from 'src/movimiento/enums/tipo-movimiento.enum';
import { EntityManager, Repository } from 'typeorm';
import { CreateCuentaCorrienteDTO } from './dto/create-cuenta-corriente.dto';
import { UpdateCuentaCorrienteDTO } from './dto/update-cuenta-corriente.dto';

@Injectable()
export class CuentaCorrienteService {
  constructor(
    @InjectRepository(CuentaCorriente)
    private cuentaCorrienteRepository: Repository<CuentaCorriente>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Movimiento)
    private movimientoRepository: Repository<Movimiento>,
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
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
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

      Object.assign(ccExistente, ccDTO);
      return await this.cuentaCorrienteRepository.save(ccExistente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar la cuenta corriente: ' + error,
      );
    }
  }

  async afectarCuentaCorriente(
    clienteId: number,
    importe: number,
    tipoMovimiento: TipoMovimiento,
    entityManager?: EntityManager,
  ): Promise<CuentaCorriente> {
    const cuentaCorriente = await this.cuentaCorrienteRepository.findOne({
      where: { id: clienteId },
      relations: ['movimientos'],
    });

    if (!cuentaCorriente) {
      throw new NotFoundException(
        `Cuenta corriente con id ${clienteId} no encontrada`,
      );
    }

    switch (tipoMovimiento) {
      case TipoMovimiento.VENTA:
        cuentaCorriente.saldo -= importe;
        break;
      case TipoMovimiento.PAGO:
        cuentaCorriente.saldo += importe;
        break;
      case TipoMovimiento.DEVOLUCION:
        cuentaCorriente.saldo += importe;
        break;
    }

    const movimiento = entityManager
      ? entityManager.create(Movimiento, {
          fechaMovimiento: new Date(),
          importe: importe,
          tipoMovimiento: tipoMovimiento,
        })
      : this.movimientoRepository.create({
          fechaMovimiento: new Date(),
          importe: importe,
          tipoMovimiento: tipoMovimiento,
        });

    cuentaCorriente.movimientos.push(movimiento);

    const cuentaCorrienteActualizada = entityManager
      ? await entityManager.save(CuentaCorriente, cuentaCorriente)
      : await this.cuentaCorrienteRepository.save(cuentaCorriente);

    delete cuentaCorrienteActualizada.movimientos;

    return cuentaCorrienteActualizada;
  }

  async findOneByClienteId(clienteId: number): Promise<CuentaCorriente> {
    try {
      const cuentaCorriente = await this.cuentaCorrienteRepository.findOne({
        where: { cliente: { id: clienteId } },
        relations: { cliente: true, movimientos: true },
      });

      if (!cuentaCorriente) {
        throw new NotFoundException(
          `Cuenta corriente con usuario de id ${clienteId} no encontrada`,
        );
      }

      return cuentaCorriente;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la cuenta corriente: ' + error,
      );
    }
  }
}
