import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovimientoDTO } from './dto/create-movimiento.dto';
import { UpdateMovimientoDTO } from './dto/update-movimiento.dto';
import { Movimiento } from './entities/movimiento.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private movimientoRepository: Repository<Movimiento>,
    @InjectRepository(CuentaCorriente)
    private cuentaCorrienteRepository: Repository<CuentaCorriente>,
  ) {}

  async findAll(): Promise<Movimiento[]> {
    try {
      return await this.movimientoRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los movimientos: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<Movimiento> {
    try {
      const movimiento = await this.movimientoRepository.findOne({
        where: { id },
      });

      if (!movimiento) {
        throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
      }

      return movimiento;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el movimiento: ' + error,
      );
    }
  }

  async create(movDTO: CreateMovimientoDTO): Promise<Movimiento> {
    try {
      const ccExistente = await this.cuentaCorrienteRepository.findOne({
        where: { id: movDTO.cuentaCorriente.id },
      });

      if (!ccExistente) {
        throw new NotFoundException(
          `Cuenta corriente con id ${movDTO.cuentaCorriente.id} no encontrada`,
        );
      }

      const nuevoMovimiento = this.movimientoRepository.create(movDTO);
      return await this.movimientoRepository.save(nuevoMovimiento);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear el movimiento ' + error,
      );
    }
  }

  async update(id: number, movDTO: UpdateMovimientoDTO): Promise<Movimiento> {
    try {
      const movExistente = await this.movimientoRepository.findOne({
        where: { id },
      });

      if (!movExistente) {
        throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
      }

      const ccExistente = await this.cuentaCorrienteRepository.findOne({
        where: { id: movDTO.cuentaCorriente.id },
      });

      if (!ccExistente) {
        throw new NotFoundException(
          `Cuenta corriente con id ${id} no encontrada`,
        );
      }

      const movActualizado = Object.assign(movExistente, movDTO);
      return await this.movimientoRepository.save(movActualizado);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar el movimiento: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const movimiento = await this.movimientoRepository.findOne({
        where: { id },
      });

      if (!movimiento) {
        throw new NotFoundException(`Movimiento con id ${id} no encontrado`);
      }

      this.movimientoRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la obra social: ' + error,
      );
    }
  }
}
