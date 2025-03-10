import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'date-fns/parse';
import { Venta } from 'src/venta/entities/venta.entity';
import { Repository } from 'typeorm';
import { Factura } from '../../facturador/entities/factura.entity';
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
import {
  extraerPuntoVentaYTipoComprobante,
  incrementarComprobante,
  procesarRespuestaAFIP,
} from '../utils/helpers';
import { AfipService } from './afip.service';
@Injectable()
export class FacturadorService {
  constructor(
    private readonly afipService: AfipService,
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
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
  public async guardarFactura(factura: IProcesadoExitoso, venta: Venta) {
    const fechaFactura = parse(
      factura.fechaFactura.toString(),
      'yyyyMMdd',
      new Date(),
    );

    const nuevaFactura = await this.facturaRepository.create({
      CAE: factura.CAE,
      fechaEmision: fechaFactura,
      numeroComprobante: factura.numeroFactura,
      tipoDocumento: factura.docTipo,
      numeroDocumento: factura.docNro,
      tipoComprobante: factura.cbteTipo,
      venta: venta,
    });

    const facturaGuardada = await this.facturaRepository.save(nuevaFactura);

    delete facturaGuardada.venta;
    return facturaGuardada;
  }
}
