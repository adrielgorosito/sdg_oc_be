import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comprobante } from '../entities/comprobante.entity';
import { AfipAuthError, AfipError, AfipErrorType } from '../errors/afip.errors';
import {
  IFECAESolicitarResult,
  IFECompUltimoAutorizadoResult,
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
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
    @InjectRepository(Comprobante)
    private readonly facturaRepository: Repository<Comprobante>,
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
  public async guardarFactura(factura: Comprobante) {
    const facturaGuardada = await this.facturaRepository.save(factura);
    delete facturaGuardada.venta;
    return facturaGuardada;
  }
}
