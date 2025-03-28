import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Comprobante } from '../entities/comprobante.entity';
import { CrearComprobanteDTO } from '../dto/create-comprobante.dto';
import { AfipService } from './afip.service';
import { ParametrosService } from 'src/parametros/parametros.service';
import { AfipAuthError, AfipError, AfipErrorType } from '../errors/afip.errors';
import { parse } from 'date-fns';
import { crearDatosNotaDeCreditoDebito } from '../utils/comprobante.utils';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IFECAESolicitarResult,
  IFECompUltimoAutorizadoResult,
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
  IProcesadoExitoso,
  ResultadoProcesado,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import {
  extraerPuntoVentaYTipoComprobante,
  incrementarComprobante,
  procesarRespuestaAFIP,
} from '../utils/helpers';

@Injectable()
export class FacturadorService {
  constructor(
    @InjectRepository(Comprobante)
    private readonly facturaRepository: Repository<Comprobante>,
    private readonly afipService: AfipService,
    private readonly configService: ParametrosService,
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

      const utlimoComprobante = await this.getUltimoComprobante(
        extraerPuntoVentaYTipoComprobante(datosComprobante),
      );

      const factura = (await this.afipService.execMethod(
        WsServicesNamesEnum.FECAESolicitar,
        {
          factura: incrementarComprobante(
            datosComprobante,
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
      } else {
        const comprobante = this.facturaRepository.create({
          ...comprobanteDTO,
          numeroComprobante: (resultado as IProcesadoExitoso).numeroComprobante,
          CAE: (resultado as IProcesadoExitoso).CAE,
          fechaEmision: parse(
            (resultado as IProcesadoExitoso).fechaFactura.toString(),
            'yyyyMMdd',
            new Date(),
          ),
          tipoComprobante: comprobanteDTO.tipoComprobante,
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
    const facturaGuardada = em
      ? await em.save(comprobante)
      : await this.facturaRepository.save(comprobante);
    if (facturaGuardada.venta) {
      delete facturaGuardada.venta;
    }
    return facturaGuardada;
  }

  async findAllByClienteId(clienteId: number): Promise<Comprobante[]> {
    try {
      const comprobantes = await this.facturaRepository.find({
        where: [
          { venta: { cliente: { id: clienteId } } },
          { facturaRelacionada: { venta: { cliente: { id: clienteId } } } },
        ],
        relations: { venta: { cliente: true }, facturaRelacionada: true },
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
}
