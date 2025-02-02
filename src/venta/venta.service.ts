import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}
}
// Crear una nueva venta
/* async create(createVentaDto: CreateVentaDTO): Promise<Venta> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: createVentaDto.cliente.id },
      });
      if (!clienteExistente) {
        throw new NotFoundException('Cliente no encontrado');
      }
      const nuevaVenta = this.ventaRepository.create(createVentaDto);
      return await this.ventaRepository.save(nuevaVenta);
    } catch (error) {}
  } */

// Obtener todas las ventas
/*  async findAll(): Promise<Venta[]> {
    return await this.ventaRepository.find();
  }

  // Obtener una venta por ID
  async findOne(id: number): Promise<Venta> {
    return await this.ventaRepository.findOneOrFail({ where: { id } });
  }

  // Actualizar una venta
  async update(id: number, updateVentaDto: UpdateVentaDTO): Promise<Venta> {
    await this.ventaRepository.update(id, updateVentaDto);
    return this.findOne(id);
  }

  // Eliminar una venta
  async remove(id: number): Promise<void> {
    await this.ventaRepository.delete(id);
  }

  // Obtener ventas por fecha
  async findByDate(fecha: Date): Promise<Venta[]> {
    return await this.ventaRepository.find({
      where: {
        fechaVenta: fecha,
      },
    });
  }

  // Calcular total de ventas por período
  async calculateTotalVentas(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<number> {
    const ventas = await this.ventaRepository.find({
      where: {
        fechaVenta: Between(fechaInicio, fechaFin),
      },
    });

    return ventas.reduce((total, venta) => total + venta.total, 0);
  }
} */
