export interface Comprobante {
  Id: number;
  Descripcion: string;
}

export interface TipoContribuyente {
  Id: number;
  comprobantes: Comprobante[];
}

export interface TiposComprobante {
  MONOTRIBUTISTA: TipoContribuyente;
  RESPONSABLE_INSCRIPTO: TipoContribuyente;
  CONSUMIDOR_FINAL: TipoContribuyente;
  EXENTO: TipoContribuyente;
}

export interface TiposDocumento {
  DNI: number;
  CUIT: number;
}
