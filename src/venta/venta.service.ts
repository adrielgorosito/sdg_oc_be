import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { Repository } from 'typeorm';
import { CreateVentaDTO } from './dto/create-venta.dto';
import { UpdateVentaDTO } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<Venta> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: createVentaDto.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      const importe = createVentaDto.lineasDeVenta.reduce(
        (total, linea) => total + linea.precioIndividual * linea.cantidad,
        0,
      );
      const nuevaVenta = this.ventaRepository.create(createVentaDto);
      nuevaVenta.importe = importe;

      return await this.ventaRepository.save(nuevaVenta);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    try {
      const ventas = await this.ventaRepository.find({
        relations: {
          cliente: true,
          lineasDeVenta: true,
          mediosDePago: true,
        },
        order: {
          fecha: 'DESC',
        },
      });

      return ventas;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las ventas: ' + error,
      );
    }
  }

  async findOne(id: string) {
    try {
      const venta = await this.ventaRepository.findOne({
        where: { id },
        relations: {
          cliente: true,
          lineasDeVenta: true,
          mediosDePago: true,
        },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }
      return venta;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener la venta: ' + error,
      );
    }
  }

  async update(id: string, updateVentaDto: UpdateVentaDTO): Promise<Venta> {
    try {
      const ventaExistente = await this.ventaRepository.findOne({
        where: { id },
      });

      if (!ventaExistente) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }
      Object.assign(ventaExistente, updateVentaDto);
      return await this.ventaRepository.save(ventaExistente);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar la venta: ' + error,
      );
    }
  }

  async remove(id: string) {
    try {
      const venta = await this.ventaRepository.findOne({
        where: { id },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }

      await this.ventaRepository.remove(venta);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar la venta: ' + error,
      );
    }
  }

  async findByCliente(id: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id },
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente con id ${id} no encontrado`);
      }
      const ventas = await this.ventaRepository.find({
        where: { cliente: cliente },
        relations: {
          cliente: true,
          lineasDeVenta: true,
          mediosDePago: true,
        },
        order: {
          fecha: 'DESC',
        },
      });

      return ventas;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener las ventas del cliente: ' + error,
      );
    }
  }

  async findByClienteDni(dni: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { dni },
      });

      if (!cliente) {
        throw new NotFoundException(`Cliente con DNI ${dni} no encontrado`);
      }
      const ventas = await this.ventaRepository.find({
        where: { cliente: cliente },
        relations: {
          cliente: true,
          lineasDeVenta: true,
          mediosDePago: true,
        },
        order: {
          fecha: 'DESC',
        },
      });

      return ventas;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener las ventas del cliente por DNI: ' + error,
      );
    }
  }
}
