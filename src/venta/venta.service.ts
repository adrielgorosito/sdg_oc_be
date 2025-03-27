import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'date-fns';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CuentaCorrienteService } from 'src/cuenta-corriente/cuenta-corriente.service';
import { Comprobante } from 'src/facturador/entities/comprobante.entity';
import { IProcesadoExitoso } from 'src/facturador/interfaces/ISoap';
import { FacturadorService } from 'src/facturador/services/facturador.service';
import { TipoMedioDePagoEnum } from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { TipoMovimiento } from 'src/movimiento/enums/tipo-movimiento.enum';
import { ParametrosService } from 'src/parametros/parametros.service';
import { DataSource, Repository } from 'typeorm';
import { crearDatosFactura } from '../facturador/utils/comprobante.utils';
import { CreateVentaDTO } from './dto/create-venta.dto';
import { UpdateVentaDTO } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
@Injectable()
export class VentaService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly facturadorService: FacturadorService,
    private readonly cuentaCorrienteService: CuentaCorrienteService,
    private readonly parametrosService: ParametrosService,
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    let venta: Venta;
    let importeAFacturar: number;
    let clienteExistente: Cliente;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      clienteExistente = await queryRunner.manager.findOne(Cliente, {
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

      const importe = createVentaDto.lineasDeVenta.reduce(
        (total, linea) => total + linea.precioIndividual * linea.cantidad,
        0,
      );

      nuevaVenta.importe = importe;

      const descuento = (importe * createVentaDto.descuentoPorcentaje) / 100;

      importeAFacturar =
        importe -
        createVentaDto.ventaObraSocial.reduce(
          (total, ventaObraSocial) => total + ventaObraSocial.importe,
          0,
        ) -
        descuento;

      const importeMaximoAFacturar = parseInt(
        (await this.parametrosService.getParam('AFIP_IMPORTE_MAXIMO_FACTURAR'))
          .value,
      );
      if (importeAFacturar > importeMaximoAFacturar) {
        throw new BadRequestException(
          'El importe a facturar no puede ser mayor a ' +
            importeMaximoAFacturar,
        );
      }

      const importeMediosDePago = createVentaDto.mediosDePago.reduce(
        (total, medio) => total + medio.importe,
        0,
      );
      if (importeMediosDePago !== importeAFacturar) {
        throw new BadRequestException(
          'El importe de los medios de pago no es igual al importe a facturar',
        );
      }

      const medioDePagoCC = createVentaDto.mediosDePago.find(
        (medio) =>
          medio.tipoMedioDePago === TipoMedioDePagoEnum.CUENTA_CORRIENTE,
      );

      if (medioDePagoCC) {
        if (!clienteExistente.cuentaCorriente) {
          throw new NotFoundException('Cliente no posee cuenta corriente');
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

      const datosFactura = await crearDatosFactura(
        clienteExistente,
        importeAFacturar,
        createVentaDto.condicionIva,
        this.parametrosService,
      );

      const facturaDesdeAfip: IProcesadoExitoso =
        (await this.facturadorService.crearFactura(
          datosFactura,
        )) as IProcesadoExitoso;

      const nuevaFactura = await queryRunner.manager.create(Comprobante, {
        CAE: facturaDesdeAfip.CAE,
        fechaEmision: parse(
          facturaDesdeAfip.fechaFactura.toString(),
          'yyyyMMdd',
          new Date(),
        ),
        numeroComprobante: facturaDesdeAfip.numeroComprobante,
        tipoComprobante: facturaDesdeAfip.cbteTipo,
        venta: venta,
        importeTotal: importeAFacturar,
      });
      const facturaPersistida = await this.facturadorService.guardarComprobante(
        nuevaFactura,
        queryRunner.manager,
      );

      await queryRunner.manager.queryRunner.commitTransaction();
      return { venta, factura: facturaPersistida };
    } catch (error) {
      await queryRunner.manager.queryRunner.rollbackTransaction();
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
