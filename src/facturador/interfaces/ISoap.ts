export enum WsServicesNamesEnum {
  FECAESolicitar = 'FECAESolicitar',
  FECompUltimoAutorizado = 'FECompUltimoAutorizado',
  LoginCms = 'LoginCms',
}

export interface IParamsAuth {
  Auth?: {
    Token: string;
    Sign: string;
    Cuit: string;
  };
}

export interface IParamsFECompUltimoAutorizado extends IParamsAuth {
  datosUltimoAutorizado: {
    PtoVta: number;
    CbteTipo: number;
  };
}

export interface IParamsFECAESolicitar extends IParamsAuth {
  datosFactura: {
    FeCAEReq: {
      FeCabReq: {
        CantReg: number;
        PtoVta: number;
        CbteTipo: number;
      };
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
          ImpIVA: number;
          ImpTrib: number;
          MonId: 'PES';
          MonCotiz: number;
          Iva?: {
            AlicIva: {
              Id: number;
              BaseImp: number;
              Importe: number;
            };
          }[];
        };
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
  FeCAERes: {
    FeCabRes: {
      PtoVta: number;
      CbteTipo: number;
      CbteNro: number;
    };
  };
}
