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
        FchServDesde: string;
        FchServHasta: string;
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
  FeCAERes: {
    FeCabRes: {
      Cuit: number;
      PtoVta: number;
      CbteTipo: number;
      FchProceso: string;
      CantReg: number;
      Resultado: string;
      Reproceso: string;
    };
    FeDetResp: {
      FEDetResponse: {
        Concepto: number;
        DocTipo: number;
        DocNro: number;
        CbteDesde: number;
        CbteHasta: number;
        Resultado: string;
        CAE: string;
        CbteFch: string;
        CAEFchVto: string;
        Obs?: {
          Observaciones: {
            Code: number;
            Msg: string;
          }[];
        };
      };
    };
    Events?: {
      Evt: {
        Code: number;
        Msg: string;
      }[];
    };
    Errors?: {
      Err: {
        Code: number;
        Msg: string;
      }[];
    };
  };
}

export const facturaPrueba: IParamsFECAESolicitar = {
  FeCAEReq: {
    FeCabReq: {
      CantReg: 1,
      PtoVta: 12,
      CbteTipo: 1, // FACTURA A
    },
    FeDetReq: {
      FECAEDetRequest: {
        Concepto: 1, // Productos
        DocTipo: 80, // CUIT
        DocNro: 20111111112,
        CbteDesde: 1,
        CbteHasta: 1,
        CbteFch: '20250221',
        ImpTotal: 176.25,
        ImpTotConc: 0,
        ImpNeto: 150,
        ImpOpEx: 0,
        ImpTrib: 0,
        ImpIVA: 26.25,
        FchServDesde: '',
        FchServHasta: '',
        FchVtoPago: '',
        MonId: 'PES',
        MonCotiz: 1,
        CondicionIVAReceptorId: 1,
        /* Tributos: {
          Tributo: [
            {
              Id: 99,
              Desc: 'Impuesto Municipal Matanza',
              BaseImp: 150,
              Alic: 5.2,
              Importe: 7.8,
            },
          ],
        },*/
        Iva: {
          AlicIva: [
            {
              Id: 5,
              BaseImp: 100,
              Importe: 21,
            },
            {
              Id: 4,
              BaseImp: 50,
              Importe: 5.25,
            },
          ],
        },
      },
    },
  },
};
