import { Decimal } from 'decimal.js';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { CondicionIva } from 'src/comprobante/enums/condicion-iva.enum';
import { TipoComprobante } from 'src/comprobante/enums/tipo-comprobante.enum';
import { TipoDocumento } from 'src/comprobante/enums/tipo-documento.enum';
import { AfipValidationError } from 'src/comprobante/errors/afip.errors';
import { IParamsFECAESolicitar } from 'src/comprobante/interfaces/ISoap';
import { ParametrosService } from 'src/parametros/parametros.service';
import { CrearComprobanteDTO } from '../dto/create-comprobante.dto';
import { Comprobante } from '../entities/comprobante.entity';
import { IDatosDocumentos } from '../interfaces/IDatosDocumentos';
import { mapeoCondicionIVA, mapeoTipoComprobante } from './mapeosEnums';

export const crearDatosNotaDeCreditoDebito = async (
  createComprobanteDTO: CrearComprobanteDTO,
  facturaRelacionada: Comprobante,
  configService: ParametrosService,
): Promise<IParamsFECAESolicitar> => {
  const ptoVta = await configService.getParam('AFIP_PTO_VTA');
  if (!ptoVta) {
    throw new AfipValidationError('Punto de venta no configurado');
  }
  const cuitEmisor = await configService.getParam('AFIP_CUIT');
  if (!cuitEmisor) {
    throw new AfipValidationError('cuitEmisor no configurado');
  }

  const cbteTipo = createComprobanteDTO.tipoComprobante;

  const nroDocumento = facturaRelacionada.venta.cliente.nroDocumento;
  const docTipo = facturaRelacionada.venta.cliente.tipoDocumento;
  const condicionIVA = facturaRelacionada.tipoComprobante;

  const comprobantes = [
    {
      Tipo: facturaRelacionada.tipoComprobante,
      PtoVta: parseInt(ptoVta.value),
      Nro: parseInt(facturaRelacionada.numeroComprobante.split('-')[1]),
      Cuit: cuitEmisor.value,
      CbteFch: facturaRelacionada.fechaEmision
        .toISOString()
        .split('T')[0]
        .replace(/-/g, ''),
    },
  ];
  const importe = new Decimal(createComprobanteDTO.importeTotal);
  const importeNeto = importe.dividedBy(1.21).toDecimalPlaces(2);
  const importeIVA = importe.minus(importeNeto).toDecimalPlaces(2);

  return {
    FeCAEReq: {
      FeCabReq: {
        CantReg: 1,
        PtoVta: parseInt(ptoVta.value),
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
          CbteFch: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          ImpTotal: createComprobanteDTO.importeTotal,
          ImpTotConc: 0,
          CondicionIVAReceptorId: condicionIVA,
          ImpNeto: importeNeto.toNumber(),
          ImpOpEx: 0, // Importe exento
          ImpIVA: importeIVA.toNumber(),
          ImpTrib: 0, // Importe de tributos
          MonId: 'PES', // Peso Argentino
          MonCotiz: 1, // Cotización
          Iva: {
            AlicIva: [
              {
                Id: 5,
                BaseImp: importeNeto.toNumber(),
                Importe: importeIVA.toNumber(),
              },
            ],
          },
          CbtesAsoc: {
            CbteAsoc: [...comprobantes],
          },
        },
      },
    },
  };
};

export const crearDatosFactura = async (
  cliente: Cliente,
  importeAFacturar: number,
  condicionIvaReceptor: CondicionIva,
  configService: ParametrosService,
): Promise<IParamsFECAESolicitar> => {
  const { cbteTipo, docTipo, condicionIVA, nroDocumento } =
    obtenerCbteTipoYTipoDoc(cliente, condicionIvaReceptor);

  const importe = new Decimal(importeAFacturar);
  const importeNeto = importe.dividedBy(1.21).toDecimalPlaces(2);
  const importeIVA = importe.minus(importeNeto).toDecimalPlaces(2);

  const ptoVta = await configService.getParam('AFIP_PTO_VTA');
  if (!ptoVta) {
    throw new AfipValidationError('Punto de venta no configurado');
  }
  return {
    FeCAEReq: {
      FeCabReq: {
        CantReg: 1, // Cantidad de comprobantes a registrar
        PtoVta: parseInt(ptoVta.value),
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
          CbteFch: new Date().toISOString().split('T')[0].replace(/-/g, ''),
          ImpTotal: importe.toNumber(),
          ImpTotConc: 0,
          CondicionIVAReceptorId: condicionIVA,
          ImpNeto: importeNeto.toNumber(),
          ImpOpEx: 0, // Importe exento
          ImpIVA: importeIVA.toNumber(),
          ImpTrib: 0, // Importe de tributos
          MonId: 'PES', // Peso Argentino
          MonCotiz: 1, // Cotización
          Iva: {
            AlicIva: [
              {
                Id: 5,
                BaseImp: importeNeto.toNumber(),
                Importe: importeIVA.toNumber(),
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
  condicionIvaReceptor: CondicionIva,
): {
  cbteTipo: number;
  docTipo: number;
  condicionIVA: number;
  nroDocumento: number;
} => {
  if (cliente.id === 0) {
    return {
      condicionIVA: CondicionIva.CONSUMIDOR_FINAL,
      cbteTipo: TipoComprobante.FACTURA_B,
      docTipo: TipoDocumento.CONSUMIDOR_FINAL,
      nroDocumento: 0,
    };
  }
  switch (condicionIvaReceptor) {
    case CondicionIva.MONOTRIBUTISTA:
      return {
        condicionIVA: CondicionIva.MONOTRIBUTISTA,
        cbteTipo: TipoComprobante.FACTURA_A,
        docTipo: cliente.tipoDocumento,
        nroDocumento: cliente.nroDocumento,
      };
    case CondicionIva.RESPONSABLE_INSCRIPTO:
      return {
        condicionIVA: CondicionIva.RESPONSABLE_INSCRIPTO,
        cbteTipo: TipoComprobante.FACTURA_A,
        docTipo: cliente.tipoDocumento,
        nroDocumento: cliente.nroDocumento,
      };
    case CondicionIva.EXENTO:
      return {
        condicionIVA: CondicionIva.EXENTO,
        cbteTipo: TipoComprobante.FACTURA_B,
        docTipo: cliente.tipoDocumento,
        nroDocumento: cliente.nroDocumento,
      };
    case CondicionIva.CONSUMIDOR_FINAL:
      return {
        condicionIVA: CondicionIva.CONSUMIDOR_FINAL,
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
};

export const obtenerDatosDocumentoParaImprimir = (comprobante: Comprobante) => {
  let datosDocumentoParaImprimir: IDatosDocumentos;
  if (
    comprobante.tipoComprobante === TipoComprobante.NOTA_CREDITO_A ||
    comprobante.tipoComprobante === TipoComprobante.NOTA_CREDITO_B ||
    comprobante.tipoComprobante === TipoComprobante.NOTA_DEBITO_A ||
    comprobante.tipoComprobante === TipoComprobante.NOTA_DEBITO_B
  ) {
    datosDocumentoParaImprimir = {
      CAE: comprobante.CAE.toString(),
      motivo: comprobante.motivo,
      fechaEmision: comprobante.fechaEmision.toISOString(),
      CAEVencimiento: comprobante.CAEFechaVencimiento.toISOString(),
      cliente: {
        apellido: comprobante.facturaRelacionada.venta.cliente.apellido,
        condicionIVA:
          mapeoCondicionIVA[
            comprobante.facturaRelacionada.venta.cliente.categoriaFiscal
          ],
        domicilio: comprobante.facturaRelacionada.venta.cliente.domicilio,
        nombre: comprobante.facturaRelacionada.venta.cliente.nombre,
        documento:
          comprobante.facturaRelacionada.venta.cliente.nroDocumento.toString(),
      },
      tipoComprobante: mapeoTipoComprobante[comprobante.tipoComprobante],
      numeroComprobante: comprobante.numeroComprobante,
      importeTotal: comprobante.importeTotal,
    };
  } else if (
    comprobante.tipoComprobante === TipoComprobante.FACTURA_A ||
    comprobante.tipoComprobante === TipoComprobante.FACTURA_B
  ) {
    const descuentoImporteObraSocial = comprobante.venta.ventaObraSocial.reduce(
      (acc, curr) => {
        return acc + curr.importe;
      },
      0,
    );
    const descuentoPorcentajeObraSocial =
      descuentoImporteObraSocial / comprobante.venta.importe;

    datosDocumentoParaImprimir = {
      CAE: comprobante.CAE.toString(),
      fechaEmision: comprobante.fechaEmision.toISOString(),
      CAEVencimiento: comprobante.CAEFechaVencimiento.toISOString(),
      cliente: {
        apellido: comprobante.venta.cliente.apellido,
        condicionIVA:
          mapeoCondicionIVA[comprobante.venta.cliente.categoriaFiscal],
        domicilio: comprobante.venta.cliente.domicilio,
        nombre: comprobante.venta.cliente.nombre,
        documento: comprobante.venta.cliente.nroDocumento.toString(),
      },
      venta: {
        descuentoPorcentaje: comprobante.venta.descuentoPorcentaje,
        descuentoObraSocial: descuentoPorcentajeObraSocial,
        lineasDeVenta: comprobante.venta.lineasDeVenta.map((linea) => ({
          cantidad: linea.cantidad,
          precioIndividual: linea.precioIndividual,
          producto: {
            descripcion: linea.producto?.descripcion ?? '',
            categoria: linea.producto?.categoria ?? '',
            marca: linea.producto?.marca?.nombre ?? '',
          },
        })),
        fecha: comprobante.venta.fecha.toISOString(),
      },
      tipoComprobante: mapeoTipoComprobante[comprobante.tipoComprobante],
      numeroComprobante: comprobante.numeroComprobante,
      importeTotal: comprobante.importeTotal,
    };
  }
  return datosDocumentoParaImprimir;
};
