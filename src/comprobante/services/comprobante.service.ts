import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'date-fns';
import { ParametrosService } from 'src/parametros/parametros.service';
import { Venta } from 'src/venta/entities/venta.entity';
import { EntityManager, Repository } from 'typeorm';
import { CrearComprobanteDTO } from '../dto/create-comprobante.dto';
import { PaginateComprobanteDTO } from '../dto/paginate-comprobante.dto';
import { Comprobante } from '../entities/comprobante.entity';
import { AfipAuthError, AfipError, AfipErrorType } from '../errors/afip.errors';
import {
  IFECAESolicitarResult,
  IFECompUltimoAutorizadoResult,
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
  IProcesadoExitoso,
  ResultadoProcesado,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import { crearDatosNotaDeCreditoDebito } from '../utils/comprobante.utils';
import {
  extraerPuntoVentaYTipoComprobante,
  incrementarComprobante,
  procesarRespuestaAFIP,
} from '../utils/helpers';
import { AfipService } from './afip.service';

@Injectable()
export class ComprobanteService {
  constructor(
    @InjectRepository(Comprobante)
    private readonly facturaRepository: Repository<Comprobante>,
    private readonly afipService: AfipService,
    private readonly configService: ParametrosService,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  public async crearFactura(datosFactura: IParamsFECAESolicitar) {
    const utlimoComprobante = await this.getUltimoComprobante(
      extraerPuntoVentaYTipoComprobante(datosFactura),
    );

    const factura = (await this.afipService.execMethod(
      WsServicesNamesEnum.FECAESolicitar,
      {
        factura: incrementarComprobante(
          datosFactura,
          utlimoComprobante.CbteNro,
        ),
      },
    )) as IFECAESolicitarResult;

    const resultado: ResultadoProcesado = procesarRespuestaAFIP(factura);

    if ('errores' in resultado && resultado.errores.length > 0) {
      throw new AfipError(
        `Error en servicio AFIP:  ${JSON.stringify(resultado.errores)}`,
        503,
        AfipErrorType.SERVICE,
      );
    }

    return resultado;
  }

  public async getUltimoComprobante(params: IParamsFECompUltimoAutorizado) {
    const response: IFECompUltimoAutorizadoResult =
      (await this.afipService.execMethod(
        WsServicesNamesEnum.FECompUltimoAutorizado,
        { ultimoAutorizado: params },
      )) as IFECompUltimoAutorizadoResult;

    if (response.Errors) {
      throw new AfipAuthError(
        `Error en servicio AFIP:  ${JSON.stringify(response.Errors)}`,
      );
    }
    return response;
  }

  public async crearComprobante(comprobanteDTO: CrearComprobanteDTO) {
    try {
      const facturaRelacionada = await this.facturaRepository.findOne({
        where: { id: comprobanteDTO.facturaRelacionada.id },
        relations: {
          venta: { cliente: true },
        },
      });
      if (!facturaRelacionada) {
        throw new NotFoundException('Factura relacionada no encontrada');
      }

      // Validación de tipo de comprobante
      const datosComprobante = await crearDatosNotaDeCreditoDebito(
        comprobanteDTO,
        facturaRelacionada,
        this.configService,
      );

      const ultimoComprobante = await this.getUltimoComprobante(
        extraerPuntoVentaYTipoComprobante(datosComprobante),
      );

      const comprobante = (await this.afipService.execMethod(
        WsServicesNamesEnum.FECAESolicitar,
        {
          factura: incrementarComprobante(
            datosComprobante,
            ultimoComprobante.CbteNro,
          ),
        },
      )) as IFECAESolicitarResult;

      const resultado: ResultadoProcesado = procesarRespuestaAFIP(comprobante);

      if ('errores' in resultado && resultado.errores.length > 0) {
        throw new AfipError(
          `Error en servicio AFIP:  ${JSON.stringify(resultado.errores)}`,
          503,
          AfipErrorType.SERVICE,
        );
      } else {
        const comprobante = this.facturaRepository.create({
          ...comprobanteDTO,
          facturasRelacionadas: [facturaRelacionada],
          numeroComprobante: (resultado as IProcesadoExitoso).numeroComprobante,
          CAE: (resultado as IProcesadoExitoso).CAE,
          fechaEmision: parse(
            (resultado as IProcesadoExitoso).fechaFactura.toString(),
            'yyyyMMdd',
            new Date(),
          ),
        });
        return this.guardarComprobante(comprobante);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  public async guardarComprobante(
    comprobante: Comprobante,
    em?: EntityManager,
  ) {
    const comprobanteGuardado = em
      ? await em.save(comprobante)
      : await this.facturaRepository.save(comprobante);

    if (comprobanteGuardado.venta) {
      delete comprobanteGuardado.venta;
    }
    return {
      comprobanteGuardado,
    };
  }

  async findAllByClienteId(clienteId: number): Promise<Comprobante[]> {
    try {
      const comprobantes = await this.facturaRepository.find({
        where: [
          { venta: { cliente: { id: clienteId } } },
          { facturaRelacionada: { venta: { cliente: { id: clienteId } } } },
        ],
        relations: {
          venta: { cliente: true },
          facturaRelacionada: { venta: { cliente: true } },
        },
      });

      if (comprobantes.length === 0) {
        throw new NotFoundException(
          `No se encontraron comprobantes para el cliente con clienteId ${clienteId}`,
        );
      }

      return comprobantes;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener los comprobantes: ' + error,
      );
    }
  }

  async findAllComprobantes(paginateComprobanteDTO: PaginateComprobanteDTO) {
    const {
      offset,
      limit,
      nombreCliente,
      nroDocumento,
      fechaDesde,
      fechaHasta,
      clienteId,
      tipoComprobante,
    } = paginateComprobanteDTO;

    const queryBuilder = this.facturaRepository
      .createQueryBuilder('comprobante')
      .leftJoinAndSelect('comprobante.venta', 'venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('comprobante.facturaRelacionada', 'facturaRelacionada')
      .leftJoinAndSelect('facturaRelacionada.venta', 'ventaRelacionada')
      .leftJoinAndSelect('ventaRelacionada.cliente', 'clienteRelacionada')
      .take(limit)
      .skip(offset);

    if (nombreCliente) {
      queryBuilder.andWhere('cliente.nombre LIKE :nombreCliente', {
        nombreCliente: `%${nombreCliente}%`,
      });
    }

    if (nroDocumento) {
      queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
        nroDocumento: `%${nroDocumento}%`,
      });
    }

    if (fechaDesde) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde)) {
        throw new BadRequestException(
          `Formato de fecha inválido. Se esperaba 'YYYY-MM-DD'`,
        );
      }

      const fecha = parse(fechaDesde, 'yyyy-MM-dd', new Date());
      queryBuilder.andWhere('comprobante.fechaEmision  >= :fechaDesde ', {
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
      queryBuilder.andWhere('comprobante.fechaEmision  <= :fechaHasta ', {
        fechaHasta: fecha,
      });
    }
    if (clienteId) {
      queryBuilder.andWhere('comprobante.clienteId = :clienteId', {
        clienteId,
      });
    }

    if (tipoComprobante) {
      queryBuilder.andWhere('comprobante.tipoComprobante = :tipoComprobante', {
        tipoComprobante,
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
  }

  async findAllFacturas(paginateComprobanteDTO: PaginateComprobanteDTO) {
    const {
      offset,
      limit,
      nombreCliente,
      nroDocumento,
      fechaDesde,
      fechaHasta,
      clienteId,
      tipoFactura,
    } = paginateComprobanteDTO;

    const queryBuilder = this.facturaRepository
      .createQueryBuilder('comprobante')
      .leftJoinAndSelect('comprobante.venta', 'venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('comprobante.facturaRelacionada', 'facturaRelacionada')
      .leftJoinAndSelect('facturaRelacionada.venta', 'ventaRelacionada')
      .leftJoinAndSelect('ventaRelacionada.cliente', 'clienteRelacionada')
      .take(limit)
      .skip(offset);

    if (nombreCliente) {
      queryBuilder.andWhere('cliente.nombre LIKE :nombreCliente', {
        nombreCliente: `%${nombreCliente}%`,
      });
    }

    if (nroDocumento) {
      queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
        nroDocumento: `%${nroDocumento}%`,
      });
    }

    if (fechaDesde) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde)) {
        throw new BadRequestException(
          `Formato de fecha inválido. Se esperaba 'YYYY-MM-DD'`,
        );
      }

      const fecha = parse(fechaDesde, 'yyyy-MM-dd', new Date());
      queryBuilder.andWhere('comprobante.fechaEmision  >= :fechaDesde ', {
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
      queryBuilder.andWhere('comprobante.fechaEmision  <= :fechaHasta ', {
        fechaHasta: fecha,
      });
    }
    if (clienteId) {
      queryBuilder.andWhere('comprobante.clienteId = :clienteId', {
        clienteId,
      });
    }

    if (tipoFactura) {
      queryBuilder.andWhere('comprobante.tipoComprobante = :tipoComprobante', {
        tipoComprobante: tipoFactura,
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
  }

  async findOne(id: string) {
    try {
      const comprobante = await this.facturaRepository.findOne({
        where: { id },
        relations: {
          venta: {
            lineasDeVenta: true,
            cliente: true,
          },
          facturaRelacionada: {
            venta: {
              lineasDeVenta: true,
              cliente: true,
            },
          },
        },
      });

      if (!comprobante) {
        throw new NotFoundException('Comprobante no encontrado');
      }

      return comprobante;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el comprobante: ' + error,
      );
    }
  }

  async findComprobantesRelacionadosByVenta(ventaId?: string, venta?: Venta) {
    try {
      if (ventaId) {
        venta = await this.ventaRepository.findOne({
          where: { id: ventaId },
          relations: { factura: true },
        });
      }

      if (!venta) {
        throw new NotFoundException('La venta no existe');
      }

      if (venta.factura) {
        const comprobantes = await this.facturaRepository.find({
          where: { facturaRelacionada: { id: venta.factura.id } },
          relations: {
            venta: {
              lineasDeVenta: true,
              cliente: true,
            },
            facturaRelacionada: {
              venta: {
                lineasDeVenta: true,
                cliente: true,
              },
            },
          },
        });

        return comprobantes;
      }
      return [];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener los comprobantes relacionados: ' + error,
      );
    }
  }
}
