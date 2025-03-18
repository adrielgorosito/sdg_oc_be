import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuentaCorrienteService } from 'src/cuenta-corriente/cuenta-corriente.service';
import { AfipAuthError, AfipError } from 'src/facturador/errors/afip.errors';
import { IProcesadoExitoso } from 'src/facturador/interfaces/ISoap';
import { FacturadorService } from 'src/facturador/services/facturador.service';
import { TipoMedioDePagoEnum } from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { TipoMovimiento } from 'src/movimiento/enums/tipo-movimiento.enum';
import { ProductoService } from 'src/producto/producto.service';
import { DataSource, Repository } from 'typeorm';
import { CreateVentaDTO } from './dto/create-venta.dto';
import { UpdateVentaDTO } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { crearDatosFactura } from './utils/factura.utils';
@Injectable()
export class VentaService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly productoService: ProductoService,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly facturadorService: FacturadorService,
    private readonly cuentaCorrienteService: CuentaCorrienteService,
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    let venta: Venta;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const clienteExistente = await queryRunner.manager.findOne(Cliente, {
        where: { id: createVentaDto.cliente.id },
        relations: {
          cuentaCorriente: {
            movimientos: true,
          },
        },
      });

      if (!clienteExistente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      const nuevaVenta = queryRunner.manager.create(Venta, createVentaDto);

      for (const linea of nuevaVenta.lineasDeVenta) {
        await this.productoService.descontarStock(
          linea.producto.id,
          linea.cantidad,
          queryRunner,
        );
      }

      const importe = createVentaDto.lineasDeVenta.reduce(
        (total, linea) => total + linea.precioIndividual * linea.cantidad,
        0,
      );

      nuevaVenta.importe = importe;
      nuevaVenta.cliente = clienteExistente;

      const medioDePagoCC = createVentaDto.mediosDePago.find(
        (medio) =>
          medio.tipoMedioDePago === TipoMedioDePagoEnum.CUENTA_CORRIENTE,
      );

      if (medioDePagoCC) {
        if (!clienteExistente.cuentaCorriente) {
          throw new NotFoundException('Cuenta corriente no encontrada');
        }

        const cuentaCorrienteActualizada =
          await this.cuentaCorrienteService.afectarCuentaCorriente(
            clienteExistente.id,
            medioDePagoCC.importe,
            TipoMovimiento.VENTA,
            queryRunner.manager,
          );
        clienteExistente.cuentaCorriente = cuentaCorrienteActualizada;
      }

      venta = await queryRunner.manager.save(Venta, nuevaVenta);

      await queryRunner.manager.queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.manager.queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
    try {
      await queryRunner.startTransaction();

      const datosFactura = crearDatosFactura(
        venta,
        createVentaDto.facturarASuNombre,
      );
      const facturaDesdeAfipAfip: IProcesadoExitoso =
        (await this.facturadorService.crearFactura(
          datosFactura,
        )) as IProcesadoExitoso;

      const facturaPersistida = await this.facturadorService.guardarFactura(
        facturaDesdeAfipAfip,
        venta,
      );

      await queryRunner.manager.queryRunner.commitTransaction();
      return { venta, factura: facturaPersistida };
    } catch (error) {
      await queryRunner.manager.queryRunner.rollbackTransaction();

      if (
        error instanceof AfipAuthError ||
        error instanceof ServiceUnavailableException ||
        error instanceof AfipError
      ) {
        return { venta, factura: { error: error.message } };
      }

      return { venta, factura: { error: error.message } };
    } finally {
      await queryRunner.release();
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
          lineasDeVenta: {
            producto: true,
          },
          mediosDePago: true,
        },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }

      return venta;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener las ventas del cliente: ' + error,
      );
    }
  }

  async findByClienteNroDocumento(nroDocumento: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { nroDocumento },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con nroDocumento ${nroDocumento} `,
        );
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener las ventas del cliente por DNI: ' + error,
      );
    }
  }
}
