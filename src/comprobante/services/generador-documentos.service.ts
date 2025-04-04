import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { RelationTransactionalDTO } from 'src/common/dtos/relation-transactional.dto';
import { ParametrosService } from 'src/parametros/parametros.service';
import { Repository } from 'typeorm';
import { Comprobante } from '../entities/comprobante.entity';
import { IDatosDocumentos } from '../interfaces/IDatosDocumentos';
import { obtenerDatosDocumentoParaImprimir } from '../utils/comprobante.utils';

@Injectable()
export class GeneradorDocumentosService {
  constructor(
    private readonly parametroService: ParametrosService,
    @InjectRepository(Comprobante)
    private readonly comprobanteRepository: Repository<Comprobante>,
  ) {}
  async generateQR(data: object): Promise<Buffer> {
    try {
      return QRCode.toBuffer(JSON.stringify(data), {
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        scale: 5,
        margin: 2,
      });
    } catch (err) {
      throw new InternalServerErrorException(
        'Error al generar el QR: ' + err.message,
      );
    }
  }

  private async addHeader(
    doc: PDFDocument,
    data: IDatosDocumentos,
    isDuplicate: boolean,
  ) {
    // Configuración inicial
    doc.font('Helvetica');
    const startY = 10;

    const razonSocial = (
      await this.parametroService.getParam('RAZON_SOCIAL_EMPRESA')
    ).value;
    const cuit =
      (await this.parametroService.getParam('AFIP_CUIT')).value.slice(0, 2) +
      '-' +
      (await this.parametroService.getParam('AFIP_CUIT')).value.slice(2, 10) +
      '-' +
      (await this.parametroService.getParam('AFIP_CUIT')).value.slice(10);
    const domicilioFiscal = (
      await this.parametroService.getParam('DOMICILIO_FISCAL_EMPRESA')
    ).value;
    const categoriaFiscal = (
      await this.parametroService.getParam('CATEGORIA_FISCAL_EMPRESA')
    ).value;

    //DATOS CLIENTE
    doc
      .fontSize(10)
      .text(`${data.cliente.apellido}, ${data.cliente.nombre}`, 50, startY + 50)
      .text(data.cliente.domicilio, 50, startY + 65)
      .text(data.cliente.documento, 50, startY + 80)
      .text(data.cliente.condicionIVA, 50, startY + 95);

    //DATOS EMPRESA

    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .text(`${data.tipoComprobante.split(' ')[0]}`, 360, startY + 50);
    doc
      .fontSize(10)
      .text(`${razonSocial}`, 360, startY + 80, {
        align: 'left',
      })
      .text(cuit, 360, startY + 95, {
        align: 'left',
      })
      .text(domicilioFiscal, 360, startY + 110, { align: 'left' })
      .text(categoriaFiscal, 360, startY + 125, { align: 'left' });

    //DATOS COMPROBANTE

    if (isDuplicate) {
      doc.fontSize(12).text('DUPLICADO', 50, startY + 10, { align: 'center' });
    } else {
      doc.fontSize(12).text('ORIGINAL', 50, startY + 10, { align: 'center' });
    }
    doc.fontSize(30).text(data.tipoComprobante.split(' ')[1], 50, startY + 35, {
      align: 'center',
    });
    /* .fontSize(12)
      .text(`Nº: ${data.numeroComprobante}`, 50, startY + 20, {
        align: 'center',
      }); */
  }

  private addInvoiceTable(
    doc: PDFDocument,
    data: IDatosDocumentos,
    qrBuffer: Buffer,
  ) {
    const tableTop = 150;

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Detalle', 50, tableTop + 10)
      .text('Cantidad', 350, tableTop + 10)
      .text('P. Unitario', 420, tableTop + 10)
      .text('Importe', 515, tableTop + 10)
      .moveTo(50, tableTop + 25)
      .lineTo(565, tableTop + 25)
      .stroke();

    let yPosition = tableTop + 45;

    if (data.venta?.lineasDeVenta) {
      data.venta.lineasDeVenta.forEach((item) => {
        const precioConDescuento =
          item.precioIndividual *
          ((data.venta?.descuentoObraSocial ?? 0 > 0)
            ? 1 - data.venta.descuentoObraSocial
            : 1) *
          ((data.venta?.descuentoPorcentaje ?? 0 > 0)
            ? 1 - data.venta.descuentoPorcentaje / 100
            : 1);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            `${item.producto.descripcion} - ${item.producto.marca}`,
            50,
            yPosition,
          )
          .text(item.cantidad.toString(), 350, yPosition)
          .text(`$${precioConDescuento.toFixed(2)}`, 420, yPosition)
          .text(
            `$${(item.cantidad * precioConDescuento).toFixed(2)}`,
            500,
            yPosition,
            { align: 'right' },
          );

        yPosition += 25;
      });
    } else {
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(`${data.tipoComprobante} - ${data.motivo}`, 50, yPosition)
        .text('1', 350, yPosition)
        .text(`$${data.importeTotal.toFixed(2)}`, 500, yPosition, {
          align: 'right',
        });

      yPosition += 25;
    }

    const importe = new Decimal(data.importeTotal);
    const importeNeto = importe.dividedBy(1.21).toDecimalPlaces(2);
    const importeIVA = importe.minus(importeNeto).toDecimalPlaces(2);

    if (data.tipoComprobante === 'FACTURA B') {
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Subtotal: $', 350, yPosition + 35)
        .text(`${importe.toFixed(2)}`, 450, yPosition + 35, {
          align: 'right',
        })

        .text('Importe Otros Tributos: $', 350, yPosition + 35)
        .text(`0,00`, 450, yPosition + 35, {
          align: 'right',
        })
        .text('Importe Total: $', 350, yPosition + 60)
        .text(`${importe.toFixed(2)}`, 450, yPosition + 60, {
          align: 'right',
        });

      doc
        .text(
          'Régimen de Transparencia Fiscal Al Consumidor (Ley 27.743)',
          50,
          yPosition + 80,
          { align: 'left' },
        )
        .moveTo(50, yPosition + 90)
        .lineTo(565, yPosition + 90)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(10)
        .text('IVA Contenido: $', 300, yPosition + 110)
        .text(`$${importeIVA.toFixed(2)}`, 450, yPosition + 110, {
          align: 'right',
        })
        .text('Otros Impuestos Nacionales Indirectos: $', 300, yPosition + 130)
        .text(`0,00`, 450, yPosition + 130, {
          align: 'right',
        });
      yPosition += 150;
    } else {
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('IVA (21%)', 350, yPosition + 35)
        .text(`$${importeIVA.toFixed(2)}`, 450, yPosition + 35, {
          align: 'right',
        })
        .text('Importe Total: $', 350, yPosition + 60)
        .text(`$${importe.toFixed(2)}`, 450, yPosition + 60, {
          align: 'right',
        });
      yPosition += 70;
    }

    /*  if (data.venta?.mediosDePago) {
      let yPositionMediosDePago = yPosition + 35;
      doc.font('Helvetica-Bold').fontSize(14).text('Medios de Pago', 200);

      data.venta.mediosDePago.forEach((medio) => {
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            mapeoTipoMedioDePago[medio.formaPago],
            200,
            yPositionMediosDePago,
          )
          .text(mapeoRedDePago[medio.redPago], 250, yPositionMediosDePago)
          .text(medio.entidadBancaria, 300, yPositionMediosDePago);

        yPositionMediosDePago += 25;
      });
    } */

    doc.image(qrBuffer, 150, yPosition + 200, {
      width: 100,
    });
  }

  private enmarcarPDF(doc: PDFDocument) {
    doc.moveTo(50, 10).lineTo(565, 10).stroke();
    doc.moveTo(50, 40).lineTo(565, 40).stroke();
    doc.moveTo(50, 450).lineTo(565, 450).stroke();
    doc.moveTo(50, 550).lineTo(565, 550).stroke();
    doc.moveTo(50, 450).lineTo(50, 550).stroke();
    doc.moveTo(565, 450).lineTo(565, 550).stroke();
    doc.moveTo(50, 150).lineTo(565, 150).stroke();

    doc.moveTo(280, 40).lineTo(280, 80).stroke();
    doc.moveTo(280, 80).lineTo(330, 80).stroke();
    doc.moveTo(330, 80).lineTo(330, 40).stroke();
  }

  async generarFacturaPDF(
    datosFactura: IDatosDocumentos,
    isDuplicate: boolean,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: any[] = [];

    doc.on('data', buffers.push.bind(buffers));
    const pdfPromise = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(buffers))),
    );

    try {
      const qrBuffer = await this.generateQR({
        numero: datosFactura.numeroComprobante,
        total: datosFactura.importeTotal,
      });

      this.enmarcarPDF(doc);
      await this.addHeader(doc, datosFactura, isDuplicate);
      this.addInvoiceTable(doc, datosFactura, qrBuffer);

      doc.end();
      return pdfPromise;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al generar el PDF: ' + error.message,
      );
    }
  }

  async imprimirFactura(comprobanteDTO: RelationTransactionalDTO) {
    try {
      const comprobanteGuardado = await this.comprobanteRepository.findOne({
        where: { id: comprobanteDTO.id },
        relations: {
          facturaRelacionada: {
            venta: {
              cliente: true,
            },
          },
          venta: {
            cliente: true,
            ventaObraSocial: true,
            lineasDeVenta: { producto: { marca: true } },
            mediosDePago: true,
          },
        },
      });
      if (!comprobanteGuardado) {
        throw new NotFoundException('Comprobante no encontrado');
      }

      const datosDocumentoParaImprimir =
        obtenerDatosDocumentoParaImprimir(comprobanteGuardado);

      const pdfOriginal = await this.generarFacturaPDF(
        datosDocumentoParaImprimir,
        false,
      );
      const pdfDuplicado = await this.generarFacturaPDF(
        datosDocumentoParaImprimir,
        true,
      );

      return { pdfOriginal, pdfDuplicado, comprobante: comprobanteGuardado };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);

      throw new InternalServerErrorException(
        'Error al imprimir la factura: ' + error.message,
      );
    }
  }
}
