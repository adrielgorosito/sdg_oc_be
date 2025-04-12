import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CajaService } from 'src/caja/caja.service';
import { Caja } from 'src/caja/entities/caja.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { CreateMovimientoDTO } from 'src/movimiento/dto/create-movimiento.dto';
import { Movimiento } from 'src/movimiento/entities/movimiento.entity';
import { TipoMovimiento } from 'src/movimiento/enums/tipo-movimiento.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateCuentaCorrienteDTO } from './dto/create-cuenta-corriente.dto';
import { PaginateCCDTO } from './dto/paginate-cc.dto';
import { UpdateCuentaCorrienteDTO } from './dto/update-cuenta-corriente.dto';
@Injectable()
export class CuentaCorrienteService {
  constructor(
    @InjectRepository(CuentaCorriente)
    private cuentaCorrienteRepository: Repository<CuentaCorriente>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    private readonly dataSource: DataSource,
    private readonly cajaService: CajaService,
  ) {}

  async findAll(paginateCCDTO: PaginateCCDTO): Promise<any> {
    try {
      const { limit, offset, filtro, estado } = paginateCCDTO;

      const queryBuilder = this.cuentaCorrienteRepository
        .createQueryBuilder('cuentaCorriente')
        .innerJoinAndSelect('cuentaCorriente.cliente', 'cliente')
        .take(limit)
        .skip(offset);

      if (filtro) {
        queryBuilder.andWhere(
          '(CONCAT(LOWER(cliente.nombre), LOWER(cliente.apellido)) LIKE LOWER(:nombre) OR cliente.nroDocumento LIKE :nroDocumento)',
          {
            nombre: `%${filtro.toLowerCase().replace(' ', '').trim()}%`,
            nroDocumento: `%${filtro}%`,
          },
        );
      }

      if (estado === 0) {
        queryBuilder.andWhere('cuentaCorriente.saldo >= 0');
      }

      if (estado === 1) {
        queryBuilder.andWhere('cuentaCorriente.saldo < 0');
      }

      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        items,
        total,
        limit,
        offset,
        nextPage: total > offset + limit ? offset + limit : null,
        previousPage: offset > 0 ? offset - limit : null,
      };
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
    movimientoDTO: CreateMovimientoDTO,
    entityManager?: EntityManager,
  ): Promise<CuentaCorriente> {
    const queryRunner = entityManager
      ? null
      : this.dataSource.createQueryRunner();

    const em = entityManager || queryRunner.manager;

    try {
      if (!entityManager) {
        await queryRunner.connect();
        await queryRunner.startTransaction();
      }

      const cuentaCorriente = await em.findOne(CuentaCorriente, {
        where: { cliente: { id: clienteId } },
        relations: ['movimientos'],
      });

      if (!cuentaCorriente) {
        throw new NotFoundException(
          `Cuenta corriente con cliente ${clienteId} no encontrada`,
        );
      }

      switch (movimientoDTO.tipoMovimiento) {
        case TipoMovimiento.VENTA:
          cuentaCorriente.saldo -= movimientoDTO.importe;
          break;
        case TipoMovimiento.PAGO:
          cuentaCorriente.saldo += movimientoDTO.importe;
          break;
        case TipoMovimiento.DEVOLUCION:
          cuentaCorriente.saldo += movimientoDTO.importe;
          break;
      }

      const movimiento = em.create(Movimiento, {
        fechaMovimiento: new Date(),
        importe: movimientoDTO.importe,
        tipoMovimiento: movimientoDTO.tipoMovimiento,
      });

      cuentaCorriente.movimientos.push(movimiento);

      const cuentaCorrienteActualizada = await em.save(
        CuentaCorriente,
        cuentaCorriente,
      );

      if (movimientoDTO.tipoMovimiento !== TipoMovimiento.VENTA) {
        const caja = em.create(Caja, {
          fechaMovimiento: new Date(),
          importe: movimientoDTO.importe,
          tipoMovimiento: movimientoDTO.tipoMovimiento,
          formaPago: movimientoDTO.formaPago,
          redDePago: movimientoDTO.redDePago,
          detalle: TipoMovimiento.PAGO,
        });
        if (movimientoDTO.tipoMovimiento === TipoMovimiento.DEVOLUCION) {
          caja.importe = caja.importe * -1;
          caja.detalle = TipoMovimiento.DEVOLUCION;
        }

        await this.cajaService.createMovimientoCaja([caja], em);
      }

      if (!entityManager) {
        await queryRunner.commitTransaction();
      }

      delete cuentaCorrienteActualizada.movimientos;

      return cuentaCorrienteActualizada;
    } catch (error) {
      if (!entityManager && queryRunner) {
        await queryRunner.rollbackTransaction();
      }
      throw new InternalServerErrorException(
        'Error al afectar la cuenta corriente: ' + error,
      );
    } finally {
      if (!entityManager && queryRunner) {
        await queryRunner.release();
      }
    }
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
