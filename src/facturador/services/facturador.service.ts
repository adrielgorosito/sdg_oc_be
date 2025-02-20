import { Injectable } from '@nestjs/common';
import {
  IParamsFECAESolicitar,
  IParamsFECompUltimoAutorizado,
  WsServicesNamesEnum,
} from '../interfaces/ISoap';
import { AfipService } from './afip.service';

@Injectable()
export class FacturadorService {
  constructor(private readonly afipService: AfipService) {}

  public createBill(params: IParamsFECAESolicitar) {
    return this.afipService.execMethod(WsServicesNamesEnum.FECAESolicitar, {
      factura: params,
    });
  }

  public getLastBillNumber(params: IParamsFECompUltimoAutorizado) {
    return this.afipService.execMethod(
      WsServicesNamesEnum.FECompUltimoAutorizado,
      { ultimoAutorizado: params },
    );
  }
}
