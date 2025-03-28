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
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';
import { ParametrosService } from 'src/parametros/parametros.service';
import { DataSource, In, Repository } from 'typeorm';
import { crearDatosFactura } from '../facturador/utils/comprobante.utils';
import { CreateVentaDTO } from './dto/create-venta.dto';
import { PaginateVentaDTO } from './dto/paginate-venta.dto';
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

      const obraSocialesIds = createVentaDto.ventaObraSocial.map(
        (ventaObraSocial) => ventaObraSocial.obraSocial.id,
      );
      const obraSociales = await queryRunner.manager.find(ObraSocial, {
        where: { id: In(obraSocialesIds) },
      });
      if (obraSociales.length !== obraSocialesIds.length) {
        throw new NotFoundException('Alguna obra social no encontrada');
      }

      createVentaDto.ventaObraSocial.forEach((ventaObraSocial) => {
        const obraSocial = obraSociales.find(
          (obraSocial) => obraSocial.id === ventaObraSocial.obraSocial.id,
        );
        ventaObraSocial.obraSocial = obraSocial;
      });

      const nuevaVenta = queryRunner.manager.create(Venta, createVentaDto);

      const importe = createVentaDto.lineasDeVenta.reduce(
        (total, linea) => total + linea.precioIndividual * linea.cantidad,
        0,
      );

      nuevaVenta.importe = importe;

      const importeObraSocial =
        createVentaDto.ventaObraSocial.reduce(
          (total, ventaObraSocial) => total + ventaObraSocial.importe,
          0,
        ) || 0;

      const descuento =
        (importe - importeObraSocial) *
        (createVentaDto.descuentoPorcentaje / 100);

      importeAFacturar = importe - importeObraSocial - descuento;

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

  async findAll(paginateVentaDTO: PaginateVentaDTO) {
    try {
      const {
        limit,
        offset,
        fechaDesde,
        fechaHasta,
        clienteId,
        nombreCliente,
        nroDocumento: nroDocumentoCliente,
      } = paginateVentaDTO;

      console.log(fechaDesde);
      console.log(fechaHasta);
      console.log(clienteId);
      console.log(nombreCliente);
      console.log(nroDocumentoCliente);

      const queryBuilder = this.ventaRepository
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.cliente', 'cliente')
        .leftJoinAndSelect('venta.lineasDeVenta', 'lineasDeVenta')
        .leftJoinAndSelect('venta.mediosDePago', 'mediosDePago')
        .leftJoinAndSelect('venta.ventaObraSocial', 'ventaObraSocial')
        .orderBy('venta.fecha', 'DESC')
        .take(limit)
        .skip(offset);

      if (nombreCliente) {
        queryBuilder.andWhere(
          'CONCAT(LOWER(cliente.nombre), LOWER(cliente.apellido)) LIKE LOWER(:nombreCliente)',
          {
            nombreCliente: `%${nombreCliente.toLowerCase().replace(' ', '').trim()}%`,
          },
        );
      }

      if (nroDocumentoCliente) {
        queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
          nroDocumento: `%${nroDocumentoCliente}%`,
        });
      }

      if (clienteId) {
        queryBuilder.andWhere('cliente.id =  :clienteId', {
          clienteId,
        });
      }

      if (fechaDesde) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde)) {
          throw new BadRequestException(
            `Formato de fecha inválido. Se esperaba 'YYYY-MM-DD'`,
          );
        }

        const fecha = parse(fechaDesde, 'yyyy-MM-dd', new Date());
        queryBuilder.andWhere('venta.fecha  >= :fechaDesde ', {
          fechaDesde: fecha,
        });
      }
      if (fechaHasta) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaHasta)) {
          throw new BadRequestException(
            `Formato de fecha inválido. Se esperaba 'YYYY-MM-DD'`,
          );
        }

        const fecha = parse(fechaHasta, 'yyyy-MM-dd', new Date());
        queryBuilder.andWhere('venta.fecha  <= :fechaHasta ', {
          fechaHasta: fecha,
        });
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
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(
        'Error al obtener las ventas: ' + error.message,
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
}
