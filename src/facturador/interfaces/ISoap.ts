import { TipoComprobante } from '../enums/tipo-comprobante.enum';

export enum WsServicesNamesEnum {
  FECAESolicitar = 'FECAESolicitar',
  FECompUltimoAutorizado = 'FECompUltimoAutorizado',
  LoginCms = 'LoginCms',
}

export interface IParamsAuth {
  Token: string;
  Sign: string;
  Cuit: string;
}

export interface IParamsFECompUltimoAutorizado {
  PtoVta: number;
  CbteTipo: number;
}
interface FeCabReq {
  CantReg: number;
  PtoVta: number;
  CbteTipo: number;
}

interface Tributos {
  Tributo: Tributo[];
}

interface Tributo {
  Id: number;
  Desc: string;
  BaseImp: number;
  Alic: number;
  Importe: number;
}
interface Iva {
  AlicIva: AlicIva[];
}

interface AlicIva {
  Id: number;
  BaseImp: number;
  Importe: number;
}
export interface IParamsFECAESolicitar {
  FeCAEReq: {
    FeCabReq: FeCabReq;
    FeDetReq: {
      FECAEDetRequest: {
        DocTipo: number;
        DocNro: number;
        Concepto: number;
        CbteDesde: number;
        CbteHasta: number;
        CbteFch: string;
        ImpTotal: number;
        ImpTotConc: number;
        ImpNeto: number;
        ImpOpEx: number;
        ImpTrib: number;
        ImpIVA: number;
        FchServDesde?: string;
        FchServHasta?: string;
        CondicionIVAReceptorId: number;
        FchVtoPago: string;
        MonId: string;
        MonCotiz: number;
        Iva?: Iva;
        Tributos?: Tributos;
      };
    };
  };
}

export interface IRequest {
  method: 'POST';
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8';
    SOAPAction: string;
  };
  body: string;
}

export interface ILoginResponse {
  header: {
    source: string;
    destination: string;
    uniqueId: number;
    generationTime: string;
    expirationTime: string;
  };
  credentials: {
    token: string;
    sign: string;
  };
  '@_version': string;
}

export interface IDatosAfip {
  certBase64?: string;
  factura?: IParamsFECAESolicitar;
  ultimoAutorizado?: IParamsFECompUltimoAutorizado;
  Auth?: {
    Token: string;
    Sign: string;
    Cuit: string;
  };
}

export interface IFECompUltimoAutorizadoResult {
  PtoVta: number;
  CbteTipo: number;
  CbteNro: number;
  Errors: {
    Err: {
      Code: number;
      Msg: string;
    }[];
  };
  Events: {
    Evt: {
      Code: number;
      Msg: string;
    }[];
  };
}

export interface IFECAESolicitarResult {
  FeCabResp: {
    Cuit: number;
    PtoVta: number;
    CbteTipo: number;
    FchProceso: string;
    CantReg: number;
    Resultado: string;
    Reproceso: string;
  };
  FeDetResp: {
    FECAEDetResponse: {
      Concepto: number;
      DocTipo: number;
      DocNro: number;
      CbteDesde: number;
      CbteHasta: number;
      Resultado: string;
      CAE: number;
      CbteFch: Date;
      CAEFchVto: string;
      Observaciones?: {
        Obs:
          | {
              Code: number;
              Msg: string;
            }[]
          | { Code: number; Msg: string };
      };
    };
  };
  Events?: {
    Evt:
      | {
          Code: number;
          Msg: string;
        }[]
      | { Code: number; Msg: string };
  };
  Errors?: {
    Err:
      | {
          Code: number;
          Msg: string;
        }[]
      | { Code: number; Msg: string };
  };
}

export interface IProcesadoExitoso {
  CAE: number;
  numeroFactura: string;
  cbteTipo: TipoComprobante;
  fechaFactura: Date;
  docNro: number;
  docTipo: number;
}

export interface IProcesadoError {
  errores: Array<{ codigo: number; mensaje: string }>;
}

export type ResultadoProcesado = IProcesadoExitoso | IProcesadoError;
