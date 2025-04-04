import { Decimal } from 'decimal.js';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CondicionIva } from 'src/comprobante/enums/condicion-iva.enum';
import { TipoComprobante } from 'src/comprobante/enums/tipo-comprobante.enum';
import { TipoDocumento } from 'src/comprobante/enums/tipo-documento.enum';
import { AfipValidationError } from 'src/comprobante/errors/afip.errors';
import { IParamsFECAESolicitar } from 'src/comprobante/interfaces/ISoap';
import { ParametrosService } from 'src/parametros/parametros.service';
import { Venta } from 'src/venta/entities/venta.entity';
import { CrearComprobanteDTO } from '../dto/create-comprobante.dto';
import { Comprobante } from '../entities/comprobante.entity';
import { IDatosDocumentos } from '../interfaces/IDatosDocumentos';
import { mapeoCondicionIVA, mapeoTipoComprobante } from './mapeosEnums';

export class AfipDocumentService {
  private static async getConfigParam(
    configService: ParametrosService,
    param: string,
  ): Promise<string> {
    const value = await configService.getParam(param);
    if (!value) {
      throw new AfipValidationError(`${param} no configurado`);
    }
    return value.value;
  }

  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  private static calculateImportes(importeTotal: number) {
    const importe = new Decimal(importeTotal);
    const importeNeto = importe.dividedBy(1.21).toDecimalPlaces(2);
    return {
      ImpTotal: importe.toNumber(),
      ImpNeto: importeNeto.toNumber(),
      ImpIVA: importe.minus(importeNeto).toNumber(),
    };
  }

  static async createNotaDeCreditoDebitoParams(
    dto: CrearComprobanteDTO,
    facturaRelacionada: Comprobante,
    configService: ParametrosService,
  ): Promise<IParamsFECAESolicitar> {
    const [ptoVta, cuitEmisor] = await Promise.all([
      AfipDocumentService.getConfigParam(configService, 'AFIP_PTO_VTA'),
      AfipDocumentService.getConfigParam(configService, 'AFIP_CUIT'),
    ]);

    const { docTipo, condicionIVA, nroDocumento } =
      DocumentTypeHelper.getDocumentTypeInfo(
        facturaRelacionada.venta.cliente,
        facturaRelacionada.venta.condicionIva,
      );

    const importes = AfipDocumentService.calculateImportes(dto.importeTotal);
    const numeroComprobante = parseInt(
      facturaRelacionada.numeroComprobante.split('-')[1],
    );

    return {
      FeCAEReq: {
        FeCabReq: {
          CantReg: 1,
          PtoVta: parseInt(ptoVta),
          CbteTipo: dto.tipoComprobante,
        },
        FeDetReq: {
          FECAEDetRequest: {
            Concepto: 1,
            DocTipo: docTipo,
            DocNro: nroDocumento,
            CbteDesde: null,
            CbteHasta: null,
            FchVtoPago: null,
            CbteFch: AfipDocumentService.formatDate(new Date()),
            ...importes,
            ImpTotConc: 0,
            CondicionIVAReceptorId: condicionIVA,
            ImpOpEx: 0,
            ImpTrib: 0,
            MonId: 'PES',
            MonCotiz: 1,
            Iva: {
              AlicIva: [
                {
                  Id: 5,
                  BaseImp: importes.ImpNeto,
                  Importe: importes.ImpIVA,
                },
              ],
            },
            CbtesAsoc: {
              CbteAsoc: [
                {
                  Tipo: facturaRelacionada.tipoComprobante,
                  PtoVta: parseInt(ptoVta),
                  Nro: numeroComprobante,
                  Cuit: cuitEmisor,
                  CbteFch: AfipDocumentService.formatDate(
                    facturaRelacionada.fechaEmision,
                  ),
                },
              ],
            },
          },
        },
      },
    };
  }

  static async createFacturaParams(
    dto: CrearComprobanteDTO,
    venta: Venta,
    configService: ParametrosService,
  ): Promise<IParamsFECAESolicitar> {
    const ptoVta = await AfipDocumentService.getConfigParam(
      configService,
      'AFIP_PTO_VTA',
    );

    const { cbteTipo, docTipo, condicionIva, nroDocumento } =
      DocumentTypeHelper.getDocumentTypeInfo(venta.cliente, venta.condicionIva);

    const importes = AfipDocumentService.calculateImportes(dto.importeTotal);

    return {
      FeCAEReq: {
        FeCabReq: {
          CantReg: 1,
          PtoVta: parseInt(ptoVta),
          CbteTipo: cbteTipo,
        },
        FeDetReq: {
          FECAEDetRequest: {
            Concepto: 1,
            DocTipo: docTipo,
            DocNro: nroDocumento,
            CbteDesde: null,
            CbteHasta: null,
            FchVtoPago: null,
            CbteFch: AfipDocumentService.formatDate(new Date()),
            ...importes,
            ImpTotConc: 0,
            CondicionIVAReceptorId: condicionIva,
            ImpOpEx: 0,
            ImpTrib: 0,
            MonId: 'PES',
            MonCotiz: 1,
            Iva: {
              AlicIva: [
                {
                  Id: 5,
                  BaseImp: importes.ImpNeto,
                  Importe: importes.ImpIVA,
                },
              ],
            },
          },
        },
      },
    };
  }
}

class DocumentTypeHelper {
  static getDocumentTypeInfo(cliente: Cliente, condicionIva: CondicionIva) {
    if (cliente.id === 0) {
      return {
        condicionIVA: CondicionIva.CONSUMIDOR_FINAL,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: TipoDocumento.CONSUMIDOR_FINAL,
        nroDocumento: 0,
      };
    }
    const baseInfo = {
      docTipo: cliente.tipoDocumento,
      nroDocumento: cliente.nroDocumento,
    };

    switch (condicionIva) {
      case CondicionIva.MONOTRIBUTISTA:
      case CondicionIva.RESPONSABLE_INSCRIPTO:
        return {
          ...baseInfo,
          condicionIva,
          cbteTipo: TipoComprobante.FACTURA_A,
        };
      case CondicionIva.EXENTO:
        return {
          ...baseInfo,
          condicionIva,
          cbteTipo: TipoComprobante.FACTURA_B,
        };
      case CondicionIva.CONSUMIDOR_FINAL:
        return {
          condicionIva,
          cbteTipo: TipoComprobante.FACTURA_B,
          docTipo: TipoDocumento.DNI,
          nroDocumento:
            cliente.tipoDocumento === TipoDocumento.DNI
              ? cliente.nroDocumento
              : parseInt(cliente.nroDocumento.toString().slice(2, -1)),
        };
      default:
        throw new AfipValidationError('Categoria fiscal no válida');
    }
  }
}

class DocumentPrinter {
  private static isNota(comprobante: Comprobante): boolean {
    return [
      TipoComprobante.NOTA_CREDITO_A,
      TipoComprobante.NOTA_CREDITO_B,
      TipoComprobante.NOTA_DEBITO_A,
      TipoComprobante.NOTA_DEBITO_B,
      TipoComprobante.NOTA_CREDITO_M,
      TipoComprobante.NOTA_DEBITO_M,
      TipoComprobante.NOTA_CREDITO_C,
      TipoComprobante.NOTA_DEBITO_C,
    ].includes(comprobante.tipoComprobante);
  }

  private static isFactura(comprobante: Comprobante): boolean {
    return [
      TipoComprobante.FACTURA_A,
      TipoComprobante.FACTURA_B,
      TipoComprobante.FACTURA_C,
      TipoComprobante.FACTURA_M,
    ].includes(comprobante.tipoComprobante);
  }

  private static getClienteData(cliente: Cliente): IDatosDocumentos['cliente'] {
    return {
      apellido: cliente.apellido,
      condicionIVA: mapeoCondicionIVA[cliente.categoriaFiscal],
      domicilio: cliente.domicilio,
      nombre: cliente.nombre,
      documento: cliente.nroDocumento.toString(),
    };
  }

  static getPrintableDocumentData(comprobante: Comprobante): IDatosDocumentos {
    const baseData = {
      CAE: comprobante.CAE.toString(),
      fechaEmision: comprobante.fechaEmision.toISOString(),
      CAEVencimiento: comprobante.CAEFechaVencimiento.toISOString(),
      tipoComprobante: mapeoTipoComprobante[comprobante.tipoComprobante],
      numeroComprobante: comprobante.numeroComprobante,
      importeTotal: comprobante.importeTotal,
    };
    const cliente =
      comprobante.venta?.cliente ??
      comprobante.facturaRelacionada?.venta?.cliente;

    if (DocumentPrinter.isNota(comprobante)) {
      return {
        ...baseData,
        motivo: comprobante.motivo,
        cliente: DocumentPrinter.getClienteData(cliente),
      };
    }

    if (DocumentPrinter.isFactura(comprobante)) {
      const descuentoImporteObraSocial =
        comprobante.venta?.ventaObraSocial.reduce(
          (acc, curr) => acc + curr.importe,
          0,
        ) ?? 0;

      return {
        ...baseData,
        cliente: DocumentPrinter.getClienteData(cliente),
        venta: {
          descuentoPorcentaje: comprobante.venta.descuentoPorcentaje,
          descuentoObraSocial:
            descuentoImporteObraSocial / comprobante.venta.importe,
          lineasDeVenta: comprobante.venta.lineasDeVenta.map((linea) => ({
            cantidad: linea.cantidad,
            precioIndividual: linea.precioIndividual,
            producto: {
              descripcion: linea.producto?.descripcion ?? '',
              categoria: linea.producto?.categoria ?? '',
              marca: linea.producto?.marca?.nombre ?? '',
            },
          })),
          mediosDePago: comprobante.venta.mediosDePago.map((medio) => ({
            redPago: medio.redDePago,
            formaPago: medio.tipoMedioDePago,
            entidadBancaria: medio.entidadBancaria,
          })),
          fecha: comprobante.venta.fecha.toISOString(),
        },
      };
    }

    throw new Error('Tipo de comprobante no soportado');
  }
}

export const crearDatosNotaDeCreditoDebito =
  AfipDocumentService.createNotaDeCreditoDebitoParams;
export const crearDatosFactura = AfipDocumentService.createFacturaParams;
export const obtenerDatosDocumentoParaImprimir =
  DocumentPrinter.getPrintableDocumentData;
