import { ConfigService } from '@nestjs/config';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { TipoContribuyente } from 'src/facturador/enums/condicion-iva.enum';
import { TipoComprobante } from 'src/facturador/enums/tipo-comprobante.enum';
import { TipoDocumento } from 'src/facturador/enums/tipo-documento.enum';
import { AfipValidationError } from 'src/facturador/errors/afip.errors';
import { IParamsFECAESolicitar } from 'src/facturador/interfaces/ISoap';
import { Venta } from 'src/venta/entities/venta.entity';

const IVA_TASA = 0.21;
const BASE_IMPONIBLE_TASA = 1.21;

export const crearDatosFactura = (
  venta: Venta,
  facturarASuNombre: boolean,
): IParamsFECAESolicitar => {
  const configService = new ConfigService();

  const { cbteTipo, docTipo, condicionIVA } = obtenerCbteTipoYTipoDoc(
    venta.cliente,
    facturarASuNombre,
  );

  const importeNeto = Math.round(venta.importe / BASE_IMPONIBLE_TASA);
  const importeIVA = Math.round(importeNeto * IVA_TASA);

  return {
    FeCAEReq: {
      FeCabReq: {
        CantReg: 1, // Cantidad de comprobantes a registrar
        PtoVta: configService.get('AFIP_PTO_VTA'),
        CbteTipo: cbteTipo,
      },
      FeDetReq: {
        FECAEDetRequest: {
          Concepto: 1,
          DocTipo: docTipo,
          DocNro: !facturarASuNombre ? 0 : venta.cliente.nroDocumento,
          CbteDesde: null,
          CbteHasta: null,
          FchVtoPago: null,
          CbteFch: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          ImpTotal: venta.importe,
          ImpTotConc: 0,
          CondicionIVAReceptorId: condicionIVA,
          ImpNeto: importeNeto,
          ImpOpEx: 0, // Importe exento
          ImpIVA: importeIVA,
          ImpTrib: 0, // Importe de tributos
          MonId: 'PES', // Peso Argentino
          MonCotiz: 1, // Cotización
          Iva: {
            AlicIva: [
              {
                Id: 5,
                BaseImp: importeNeto,
                Importe: importeIVA,
              },
            ],
          },
        },
      },
    },
  };
};

const obtenerCbteTipoYTipoDoc = (
  cliente: Cliente,
  facturarASuNombre: boolean,
): { cbteTipo: number; docTipo: number; condicionIVA: number } => {
  if (!facturarASuNombre) {
    return {
      condicionIVA: TipoContribuyente.CONSUMIDOR_FINAL,
      cbteTipo: TipoComprobante.FACTURA_B,
      docTipo: TipoDocumento.CONSUMIDOR_FINAL,
    };
  }
  switch (cliente.categoriaFiscal) {
    case TipoContribuyente.MONOTRIBUTISTA:
      return {
        condicionIVA: TipoContribuyente.MONOTRIBUTISTA,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: TipoDocumento.DNI,
      };
    case TipoContribuyente.RESPONSABLE_INSCRIPTO:
      return {
        condicionIVA: TipoContribuyente.RESPONSABLE_INSCRIPTO,
        cbteTipo: TipoComprobante.FACTURA_A,
        docTipo: TipoDocumento.CUIT,
      };
    case TipoContribuyente.EXENTO:
      return {
        condicionIVA: TipoContribuyente.EXENTO,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: TipoDocumento.CUIT,
      };
    case TipoContribuyente.CONSUMIDOR_FINAL:
      return {
        condicionIVA: TipoContribuyente.CONSUMIDOR_FINAL,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: TipoDocumento.DNI,
      };
    default:
      throw new AfipValidationError('Categoria fiscal no válida');
  }
};
