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
    const startY = 50;

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
      .text(`${data.cliente.apellido}, ${data.cliente.nombre}`, 50, startY + 15)
      .text(data.cliente.domicilio, 50, startY + 30)
      .text(data.cliente.documento, 50, startY + 45)
      .text(data.cliente.condicionIVA, 50, startY + 60);

    //DATOS COMPROBANTE

    if (isDuplicate) {
      doc.fontSize(12).text('DUPLICADO', 50, startY - 20, { align: 'center' });
    }
    doc
      .fontSize(20)
      .text(data.tipoComprobante, 50, startY, {
        align: 'center',
      })
      .fontSize(12)
      .text(`Nº: ${data.numeroComprobante}`, 50, startY + 20, {
        align: 'center',
      });

    //DATOS EMPRESA
    doc
      .fontSize(10)
      .text(`${razonSocial}`, 400, startY + 15, {
        align: 'right',
      })
      .text(cuit, 400, startY + 30, {
        align: 'right',
      })
      .text(domicilioFiscal, 400, startY + 45, { align: 'right' })
      .text(categoriaFiscal, 400, startY + 60, { align: 'right' });
  }

  private addInvoiceTable(
    doc: PDFDocument,
    data: IDatosDocumentos,
    qrBuffer: Buffer,
  ) {
    const tableTop = 150;

    doc
      .font('Helvetica-Bold')
      .text('Detalle', 50, tableTop)
      .text('Cantidad', 350, tableTop)
      .text('Precio', 420, tableTop)
      .text('Total', 520, tableTop)
      .moveTo(50, tableTop + 15)
      .lineTo(570, tableTop + 15)
      .stroke();

    let yPosition = tableTop + 30;
    data.venta.lineasDeVenta.forEach((item) => {
      const precioConDescuento =
        item.precioIndividual *
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

    const importe = new Decimal(data.importeTotal);
    const importeNeto = importe.dividedBy(1.21).toDecimalPlaces(2);
    const importeIVA = importe.minus(importeNeto).toDecimalPlaces(2);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('IVA (21%)', 350, yPosition + 35)
      .text(`$${importeIVA.toFixed(2)}`, 450, yPosition + 35, {
        align: 'right',
      })
      .text('TOTAL', 350, yPosition + 60)
      .text(`$${importe.toFixed(2)}`, 450, yPosition + 60, { align: 'right' });

    doc.image(qrBuffer, 150, yPosition + 10, {
      width: 100,
    });
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

      return { pdfOriginal, pdfDuplicado };
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);

      throw new InternalServerErrorException(
        'Error al imprimir la factura: ' + error.message,
      );
    }
  }
}
