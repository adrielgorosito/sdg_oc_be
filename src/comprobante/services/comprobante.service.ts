import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMedioDePagoDto } from 'src/medio-de-pago/dto/create-medio-de-pago.dto';
import { ParametrosService } from 'src/parametros/parametros.service';
import { Venta } from 'src/venta/entities/venta.entity';
import { Repository } from 'typeorm';
import { CrearComprobanteDTO } from '../dto/create-comprobante.dto';
import { PaginateComprobanteDTO } from '../dto/paginate-comprobante.dto';
import { Comprobante } from '../entities/comprobante.entity';
import { CondicionIva } from '../enums/condicion-iva.enum';
import { TipoComprobante } from '../enums/tipo-comprobante.enum';
import { AfipAuthError, AfipError, AfipErrorType } from '../errors/afip.errors';
import {
  IFECompUltimoAutorizadoResult,
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
  IProcesadoExitoso,
  ResultadoProcesado,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import {
  crearDatosFactura,
  crearDatosNotaDeCreditoDebito,
} from '../utils/comprobante.utils';
import {
  extraerPuntoVentaYTipoComprobante,
  incrementarComprobante,
  procesarRespuestaAFIP,
} from '../utils/helpers';
import { mapeoTipoComprobanteSegunCondicionIvaCliente } from '../utils/mapeosEnums';
import { AfipService } from './afip.service';

@Injectable()
export class ComprobanteService {
  constructor(
    @InjectRepository(Comprobante)
    private readonly comprobanteRepository: Repository<Comprobante>,
    private readonly afipService: AfipService,
    private readonly parametrosService: ParametrosService,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  private async getUltimoComprobante(params: IParamsFECompUltimoAutorizado) {
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

  async crearComprobante(
    comprobanteDTO?: CrearComprobanteDTO,
    venta?: Venta,
  ): Promise<Comprobante> {
    const tipoComprobante = venta
      ? mapeoTipoComprobanteSegunCondicionIvaCliente[venta.condicionIva][0]
      : comprobanteDTO.tipoComprobante;

    if (!comprobanteDTO) {
      comprobanteDTO = {
        tipoComprobante,
      };
    }

    const processor = this.getComprobanteProcessor(tipoComprobante);
    const datosComprobantes = await processor.processDatos(
      comprobanteDTO,
      venta,
    );
    return this.processComprobante(comprobanteDTO, datosComprobantes, venta);
  }

  async findAllByClienteId(clienteId: number): Promise<Comprobante[]> {
    try {
      const comprobantes = await this.comprobanteRepository.find({
        where: [
          { venta: { cliente: { id: clienteId } } },
          { facturaRelacionada: { venta: { cliente: { id: clienteId } } } },
        ],
        relations: {
          venta: { cliente: true },
          facturaRelacionada: { venta: { cliente: true } },
        },
        order: {
          fechaEmision: 'DESC',
        },
      });

      if (comprobantes.length === 0) {
        return [];
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

    const queryBuilder = this.comprobanteRepository
      .createQueryBuilder('comprobante')
      .leftJoinAndSelect('comprobante.venta', 'venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('comprobante.facturaRelacionada', 'facturaRelacionada')
      .leftJoinAndSelect('facturaRelacionada.venta', 'ventaRelacionada')
      .leftJoinAndSelect('ventaRelacionada.cliente', 'clienteRelacionada')
      .orderBy('comprobante.fechaEmision', 'DESC')
      .take(limit)
      .skip(offset);

    if (nombreCliente) {
      queryBuilder.andWhere(
        '(CONCAT(cliente.apellido, cliente.nombre) COLLATE Latin1_General_CI_AI LIKE :nombreCliente OR CONCAT(cliente.nombre, cliente.apellido) COLLATE Latin1_General_CI_AI LIKE :nombreCliente OR CONCAT(clienteRelacionada.apellido, clienteRelacionada.nombre) COLLATE Latin1_General_CI_AI LIKE :nombreCliente OR CONCAT(clienteRelacionada.nombre, clienteRelacionada.apellido) COLLATE Latin1_General_CI_AI LIKE :nombreCliente)',
        {
          nombreCliente: `%${nombreCliente}%`,
        },
      );
    }

    if (nroDocumento) {
      queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
        nroDocumento: `%${nroDocumento}%`,
      });
    }

    const whereParams: Record<string, any> = {};
    if (fechaDesde) {
      const fechaDesdeDate = new Date(fechaDesde + 'T00:00:00-03:00');
      whereParams.fechaDesde = fechaDesdeDate;
    }
    if (fechaHasta) {
      const fechaHastaDate = new Date(fechaHasta + 'T23:59:59-03:00');
      whereParams.fechaHasta = fechaHastaDate;
    }

    if (fechaDesde && fechaHasta) {
      queryBuilder.andWhere(
        'comprobante.fechaEmision BETWEEN :fechaDesde AND :fechaHasta',
        whereParams,
      );
    } else if (fechaDesde) {
      queryBuilder.andWhere(
        'comprobante.fechaEmision >= :fechaDesde',
        whereParams,
      );
    } else if (fechaHasta) {
      queryBuilder.andWhere(
        'comprobante.fechaEmision <= :fechaHasta',
        whereParams,
      );
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

    const queryBuilder = this.comprobanteRepository
      .createQueryBuilder('comprobante')
      .leftJoinAndSelect('comprobante.venta', 'venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('comprobante.facturaRelacionada', 'facturaRelacionada')
      .leftJoinAndSelect('facturaRelacionada.venta', 'ventaRelacionada')
      .leftJoinAndSelect('ventaRelacionada.cliente', 'clienteRelacionada')
      .orderBy('comprobante.fechaEmision', 'DESC')
      .take(limit)
      .skip(offset);

    if (nombreCliente) {
      queryBuilder.andWhere(
        '(CONCAT(cliente.apellido, cliente.nombre) COLLATE Latin1_General_CI_AI LIKE :nombreCliente OR CONCAT(cliente.nombre, cliente.apellido) COLLATE Latin1_General_CI_AI LIKE :nombreCliente OR CONCAT(clienteRelacionada.apellido, clienteRelacionada.nombre) COLLATE Latin1_General_CI_AI LIKE :nombreCliente OR CONCAT(clienteRelacionada.nombre, clienteRelacionada.apellido) COLLATE Latin1_General_CI_AI LIKE :nombreCliente)',

        {
          nombreCliente: `%${nombreCliente}%`,
        },
      );
    }

    if (nroDocumento) {
      queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
        nroDocumento: `%${nroDocumento}%`,
      });
    }

    const whereParams: Record<string, any> = {};
    if (fechaDesde) {
      const fechaDesdeDate = new Date(fechaDesde + 'T00:00:00-03:00');
      whereParams.fechaDesde = fechaDesdeDate;
    }
    if (fechaHasta) {
      const fechaHastaDate = new Date(fechaHasta + 'T23:59:59-03:00');
      whereParams.fechaHasta = fechaHastaDate;
    }

    if (fechaDesde && fechaHasta) {
      queryBuilder.andWhere(
        'comprobante.fechaEmision BETWEEN :fechaDesde AND :fechaHasta',
        whereParams,
      );
    } else if (fechaDesde) {
      queryBuilder.andWhere(
        'comprobante.fechaEmision >= :fechaDesde',
        whereParams,
      );
    } else if (fechaHasta) {
      queryBuilder.andWhere(
        'comprobante.fechaEmision <= :fechaHasta',
        whereParams,
      );
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
      const comprobante = await this.comprobanteRepository.findOne({
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
        order: {
          fechaEmision: 'DESC',
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
        const comprobantes = await this.comprobanteRepository.find({
          where: [{ facturaRelacionada: { id: venta.factura.id } }],
          relations: {
            facturaRelacionada: true,
          },
          order: {
            fechaEmision: 'DESC',
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

  private async processAfipResponse(
    comprobante: any,
  ): Promise<IProcesadoExitoso> {
    const resultado: ResultadoProcesado = procesarRespuestaAFIP(comprobante);

    if ('errores' in resultado && resultado.errores.length > 0) {
      throw new AfipError(
        `Error en servicio AFIP: ${JSON.stringify(resultado.errores)}`,
        503,
        AfipErrorType.SERVICE,
      );
    }

    return resultado as IProcesadoExitoso;
  }

  private async processComprobante(
    dto: CrearComprobanteDTO,
    datosComprobante: IParamsFECAESolicitar,
    venta?: Venta,
    facturaRelacionada?: Comprobante,
  ): Promise<Comprobante> {
    const ultimoComprobante = await this.getUltimoComprobante(
      extraerPuntoVentaYTipoComprobante(datosComprobante),
    );

    const afipResponse = await this.afipService.execMethod(
      WsServicesNamesEnum.FECAESolicitar,
      {
        factura: incrementarComprobante(
          datosComprobante,
          ultimoComprobante.CbteNro,
        ),
      },
    );

    const isFactura = this.isFactura(dto.tipoComprobante);
    const isNota = this.isNota(dto.tipoComprobante);

    const resultado = await this.processAfipResponse(afipResponse);

    const comprobante = this.comprobanteRepository.create({
      ...dto,
      venta: isFactura
        ? venta
          ? venta
          : { id: dto.transaccionRelacionadaId.id }
        : null,
      facturaRelacionada: isNota
        ? facturaRelacionada
          ? facturaRelacionada
          : { id: dto.transaccionRelacionadaId.id }
        : null,
      numeroComprobante: resultado.numeroComprobante,
      CAE: resultado.CAE,
      CAEFechaVencimiento: new Date(),
      fechaEmision: new Date(),
    });

    const savedComprobante = await this.comprobanteRepository.save(comprobante);

    return savedComprobante;
  }

  private getComprobanteProcessor(tipoComprobante: TipoComprobante) {
    if (this.isNota(tipoComprobante)) {
      return new NotaProcessor(
        this.comprobanteRepository,
        this.parametrosService,
        this.ventaRepository,
      );
    }
    if (this.isFactura(tipoComprobante)) {
      return new FacturaProcessor(
        this.comprobanteRepository,
        this.parametrosService,
        this.ventaRepository,
      );
    }
    throw new BadRequestException('Tipo de comprobante no soportado');
  }

  private isNota(tipo: TipoComprobante): boolean {
    return [
      TipoComprobante.NOTA_CREDITO_A,
      TipoComprobante.NOTA_CREDITO_B,
      TipoComprobante.NOTA_DEBITO_A,
      TipoComprobante.NOTA_DEBITO_B,
      TipoComprobante.NOTA_CREDITO_C,
      TipoComprobante.NOTA_DEBITO_C,
      TipoComprobante.NOTA_DEBITO_M,
      TipoComprobante.NOTA_CREDITO_M,
    ].includes(tipo);
  }

  private isFactura(tipo: TipoComprobante): boolean {
    return [
      TipoComprobante.FACTURA_A,
      TipoComprobante.FACTURA_B,
      TipoComprobante.FACTURA_C,
      TipoComprobante.FACTURA_M,
    ].includes(tipo);
  }

  async facturarPendientes() {
    try {
      const pendientes = await this.ventaRepository
        .createQueryBuilder('venta')
        .innerJoinAndSelect('venta.cliente', 'cliente')
        .innerJoinAndSelect('venta.lineasDeVenta', 'lineasDeVenta')
        .innerJoinAndSelect('venta.mediosDePago', 'mediosDePago')
        .leftJoinAndSelect('venta.ventaObraSocial', 'ventaObraSocial')
        .leftJoin('venta.factura', 'factura')
        .where('factura.id IS NULL')
        .getMany();

      if (pendientes.length === 0) {
        return { message: 'No hay ventas pendientes' };
      }

      const resultados = {
        exitosas: [],
        fallidas: [],
      };

      for (const venta of pendientes) {
        try {
          await this.crearComprobante(null, venta);
          resultados.exitosas.push(venta.id);
        } catch (error) {
          resultados.fallidas.push({
            ventaId: venta.id,
            error: error.message,
          });
        }
      }

      return {
        message: 'Proceso de facturación completado',
        resultados,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al procesar las ventas pendientes: ' + error,
      );
    }
  }
}

abstract class ComprobanteProcessor {
  constructor(
    protected comprobanteRepository: Repository<Comprobante>,
    protected parametrosService: ParametrosService,
    protected ventaRepository: Repository<Venta>,
  ) {}

  abstract processDatos(
    dto: CrearComprobanteDTO,
    venta: Venta,
  ): Promise<Comprobante>;

  protected async processAfipResponse(
    comprobante: any,
  ): Promise<IProcesadoExitoso> {
    const resultado: ResultadoProcesado = procesarRespuestaAFIP(comprobante);

    if ('errores' in resultado && resultado.errores.length > 0) {
      throw new AfipError(
        `Error en servicio AFIP: ${JSON.stringify(resultado.errores)}`,
        503,
        AfipErrorType.SERVICE,
      );
    }
    return resultado as IProcesadoExitoso;
  }
}
class NotaProcessor extends ComprobanteProcessor {
  async processDatos(dto: CrearComprobanteDTO): Promise<any> {
    if (!dto.transaccionRelacionadaId) {
      throw new BadRequestException('La factura relacionada es requerida');
    }

    const facturaRelacionada = await this.comprobanteRepository.findOne({
      where: { id: dto.transaccionRelacionadaId.id },
      relations: { venta: { cliente: true } },
    });

    if (!facturaRelacionada) {
      throw new NotFoundException('Factura relacionada no encontrada');
    }

    const datosComprobante = await crearDatosNotaDeCreditoDebito(
      dto,
      facturaRelacionada,
      this.parametrosService,
    );

    return datosComprobante;
  }
}
class FacturaProcessor extends ComprobanteProcessor {
  async processDatos(
    dto: CrearComprobanteDTO,
    venta: Venta = null,
  ): Promise<any> {
    if (!venta && !dto?.transaccionRelacionadaId) {
      throw new BadRequestException('La venta es requerida');
    }

    venta = venta || (await this.getVenta(dto.transaccionRelacionadaId.id));
    this.validateVenta(venta);

    const importeAFacturar = this.calculateImportes(venta);

    if (
      venta.condicionIva === CondicionIva.CONSUMIDOR_FINAL &&
      venta.cliente.id === 0
    ) {
      await this.validateImportes(importeAFacturar, venta.mediosDePago);
    }

    dto.importeTotal = importeAFacturar.importeAFacturar;
    const datosComprobante = await crearDatosFactura(
      dto,
      venta,
      this.parametrosService,
    );

    return datosComprobante;
  }

  private async getVenta(id: string): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: {
        cliente: true,
        lineasDeVenta: true,
        ventaObraSocial: true,
        mediosDePago: true,
        factura: true,
      },
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }
    return venta;
  }

  private validateVenta(venta: Venta) {
    if (venta.factura) {
      throw new BadRequestException('La venta ya tiene una factura');
    }
  }

  public calculateImportes(venta: Venta): {
    importeAFacturar: number;
    importeDescuentoObraSocial: number;
    descuentoEmpresa: number;
  } {
    const importeDescuentoObraSocial =
      venta.ventaObraSocial?.reduce((total, vos) => total + vos.importe, 0) ||
      0;

    const importeVentaSegunLineasDeVenta = venta.lineasDeVenta.reduce(
      (total, linea) => total + linea.precioIndividual * linea.cantidad,
      0,
    );

    const descuentoEmpresa =
      (importeVentaSegunLineasDeVenta - importeDescuentoObraSocial) *
      (venta.descuentoPorcentaje / 100);

    const importeAFacturar =
      importeVentaSegunLineasDeVenta -
      importeDescuentoObraSocial -
      descuentoEmpresa;

    return {
      importeAFacturar,
      importeDescuentoObraSocial,
      descuentoEmpresa,
    };
  }

  private async validateImportes(
    importeData: {
      importeAFacturar: number;
      importeDescuentoObraSocial: number;
      descuentoEmpresa: number;
    },
    mediosDePago: CreateMedioDePagoDto[],
  ) {
    const importeMaximoAFacturar = parseInt(
      (await this.parametrosService.getParam('AFIP_IMPORTE_MAXIMO_FACTURAR'))
        .value,
    );

    if (importeData.importeAFacturar > importeMaximoAFacturar) {
      throw new BadRequestException(
        `El importe a facturar no puede ser mayor a ${importeMaximoAFacturar}`,
      );
    }

    const importeMediosDePago = mediosDePago.reduce(
      (total, medio) => total + medio.importe,
      0,
    );

    if (importeMediosDePago !== importeData.importeAFacturar) {
      throw new BadRequestException(
        'El importe de los medios de pago no es igual al importe a facturar',
      );
    }
  }
}
