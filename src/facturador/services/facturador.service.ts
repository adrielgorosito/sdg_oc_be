import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AfipError, AfipErrorType } from '../errors/afip.errors';
import {
  facturaPrueba,
  IFECAESolicitarResult,
  IFECompUltimoAutorizadoResult,
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import {
  extraerPuntoVentaYTipoComprobante,
  incrementarComprobante,
} from '../utils/helpers';
import { AfipService } from './afip.service';

@Injectable()
export class FacturadorService {
  constructor(private readonly afipService: AfipService) {}

  public async createBill(datosFactura: IParamsFECAESolicitar = facturaPrueba) {
    try {
      const utlimoComprobante = await this.getLastBillNumber(
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

      /*  if (factura.Errors) {
        throw new AfipError(
          `Error en servicio AFIP:  ${JSON.stringify(factura.Errors)}`,
          503,
          AfipErrorType.SERVICE,
        );
      } */
      return factura;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      } else if (error instanceof AfipError) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error en servicio AFIP: ${error}`,
      );
    }
  }

  public async getLastBillNumber(params: IParamsFECompUltimoAutorizado) {
    const response: IFECompUltimoAutorizadoResult =
      (await this.afipService.execMethod(
        WsServicesNamesEnum.FECompUltimoAutorizado,
        { ultimoAutorizado: params },
      )) as IFECompUltimoAutorizadoResult;

    if (response.Errors) {
      throw new AfipError(
        `Error en servicio AFIP:  ${JSON.stringify(response.Errors)}`,
        503,
        AfipErrorType.SERVICE,
      );
    }
    return response;
  }
}
