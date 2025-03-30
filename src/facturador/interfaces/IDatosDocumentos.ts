export interface IDatosDocumentos {
  tipoComprobante: string;
  cliente: {
    nombre: string;
    apellido: string;
    domicilio: string;
    documento: string;
    condicionIVA: string;
  };
  venta?: {
    fecha: string;
    descuentoObraSocial: number;
    descuentoPorcentaje: number;
    lineasDeVenta: {
      cantidad: number;
      precioIndividual: number;
      producto: {
        descripcion: string;
        categoria: string;
        marca: string;
      };
    }[];
  };
  CAE: string;
  CAEVencimiento: string;
  numeroComprobante: string;
  fechaEmision: string;
  importeTotal: number;
}
