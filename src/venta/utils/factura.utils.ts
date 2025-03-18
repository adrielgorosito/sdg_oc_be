import { ConfigService } from '@nestjs/config';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CondicionIva } from 'src/facturador/enums/condicion-iva.enum';
import { TipoComprobante } from 'src/facturador/enums/tipo-comprobante.enum';
import { TipoDocumento } from 'src/facturador/enums/tipo-documento.enum';
import { AfipValidationError } from 'src/facturador/errors/afip.errors';
import { IParamsFECAESolicitar } from 'src/facturador/interfaces/ISoap';

export const crearDatosFactura = (
  cliente: Cliente,
  importeAFacturar: number,
  facturarASuNombre: boolean,
): IParamsFECAESolicitar => {
  const configService = new ConfigService();

  const { cbteTipo, docTipo, condicionIVA } = obtenerCbteTipoYTipoDoc(
    cliente,
    facturarASuNombre,
  );

  const importeNeto = Math.round(importeAFacturar / 1.21);
  const importeIVA = Math.round((importeAFacturar / 1.21) * 0.21);

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
          DocNro: !facturarASuNombre ? 0 : cliente.nroDocumento,
          CbteDesde: null,
          CbteHasta: null,
          FchVtoPago: null,
          CbteFch: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          ImpTotal: importeAFacturar,
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
      condicionIVA: CondicionIva.CONSUMIDOR_FINAL,
      cbteTipo: TipoComprobante.FACTURA_B,
      docTipo: TipoDocumento.CONSUMIDOR_FINAL,
    };
  }
  switch (cliente.categoriaFiscal) {
    case CondicionIva.MONOTRIBUTISTA:
      return {
        condicionIVA: CondicionIva.CONSUMIDOR_FINAL,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: cliente.tipoDocumento,
      };
    case CondicionIva.RESPONSABLE_INSCRIPTO:
      return {
        condicionIVA: CondicionIva.RESPONSABLE_INSCRIPTO,
        cbteTipo: TipoComprobante.FACTURA_A,
        docTipo: TipoDocumento.CUIT,
      };
    case CondicionIva.EXENTO:
      return {
        condicionIVA: CondicionIva.EXENTO,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: cliente.tipoDocumento,
      };
    case CondicionIva.CONSUMIDOR_FINAL:
      return {
        condicionIVA: CondicionIva.CONSUMIDOR_FINAL,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: cliente.tipoDocumento,
      };
    default:
      throw new AfipValidationError('Categoria fiscal no válida');
  }
};
