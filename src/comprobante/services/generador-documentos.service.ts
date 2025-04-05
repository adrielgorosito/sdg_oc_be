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
import { TipoMedioDePagoEnum } from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { ParametrosService } from 'src/parametros/parametros.service';
import { Repository } from 'typeorm';
import { Comprobante } from '../entities/comprobante.entity';
import { IDatosDocumentos } from '../interfaces/IDatosDocumentos';
import { obtenerDatosDocumentoParaImprimir } from '../utils/comprobante.utils';
import { mapeoRedDePago, mapeoTipoMedioDePago } from '../utils/mapeosEnums';

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

    //DATOS EMPRESA

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Razón Social:`, 50, startY + 50, {
        align: 'left',
      })
      .text(`CUIT:`, 50, startY + 70, {
        align: 'left',
      })
      .text(`Domicilio Fiscal:`, 50, startY + 90, { align: 'left' })
      .text(`Condición Frente al IVA:`, 50, startY + 110, { align: 'left' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`${razonSocial}`, 120, startY + 50, {
        align: 'left',
      })
      .text(cuit, 80, startY + 70, {
        align: 'left',
      })
      .text(domicilioFiscal, 140, startY + 90, { align: 'left' })
      .text(categoriaFiscal, 180, startY + 110, { align: 'left' });

    const tipoComprobanteSplitted = data.tipoComprobante.split(' ');
    const tipoComprobante =
      tipoComprobanteSplitted.length === 4
        ? [
            tipoComprobanteSplitted[0] +
              ' ' +
              tipoComprobanteSplitted[1] +
              ' ' +
              tipoComprobanteSplitted[2],
            tipoComprobanteSplitted[3],
          ]
        : [tipoComprobanteSplitted[0], tipoComprobanteSplitted[1]];

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(`${tipoComprobante[0]}`, 360, startY + 50, { width: 300 });

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Comprobante: ', 360, startY + 80, { align: 'left' });
    doc.fontSize(10).text(data.numeroComprobante, 440, startY + 80, {
      align: 'left',
    });

    doc.fontSize(10).text('Fecha de Emisión: ', 360, startY + 100, {
      align: 'left',
    });
    doc.fontSize(10).text(data.fechaEmision.split('T')[0], 460, startY + 100, {
      align: 'left',
    });
    //DATOS COMPROBANTE

    if (isDuplicate) {
      doc.fontSize(12).text('DUPLICADO', 50, startY + 10, { align: 'center' });
    } else {
      doc.fontSize(12).text('ORIGINAL', 50, startY + 10, { align: 'center' });
    }
    doc.fontSize(30).text(tipoComprobante[1], 50, startY + 35, {
      align: 'center',
    });

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Razón Social/Nombre: `, 50, startY + 140)
      .text(`CUIT/DNI: `, 50, startY + 160)
      .text(`Domicilio: `, 50, startY + 180)
      .text(`Condición de Venta: `, 360, startY + 140)
      .text(`Condición Frente al IVA: `, 50, startY + 200);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `${data.cliente.apellido}, ${data.cliente.nombre}`,
        160,
        startY + 140,
      )
      .text(data.cliente.documento, 105, startY + 160)
      .text(data.cliente.domicilio, 105, startY + 180)
      .text(data.cliente.condicionIVA, 170, startY + 200);

    if (data.venta?.mediosDePago) {
      let yPositionMediosDePago = startY + 160;
      data.venta.mediosDePago.forEach((medio, index) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(`${index + 1})`, 360, yPositionMediosDePago);
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            mapeoTipoMedioDePago[medio.formaPago],
            375,
            yPositionMediosDePago,
          )
          .text(
            medio.redPago
              ? medio.formaPago === TipoMedioDePagoEnum.TRANSFERENCIA_BANCARIA
                ? ''
                : mapeoRedDePago[medio.redPago]
              : '',
            480,
            yPositionMediosDePago,
          );

        yPositionMediosDePago += 20;
      });
    }
  }

  private addInvoiceTable(
    doc: PDFDocument,
    data: IDatosDocumentos,
    qrBuffer: Buffer,
  ) {
    const tableTop = 230;

    if (data.tipoComprobante === 'FACTURA A') {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Detalle', 50, tableTop + 10)
        .text('Cantidad', 280, tableTop + 10)
        .text('P. Unitario', 340, tableTop + 10)
        .text('Subtotal', 410, tableTop + 10)
        .text('Alicuota IVA', 460, tableTop + 3, {
          width: 50,
          align: 'center',
        })
        .text('Subtotal c/IVA', 520, tableTop + 3, {
          width: 50,
          align: 'center',
        })
        .moveTo(50, tableTop + 25)
        .lineTo(565, tableTop + 25)
        .stroke();

      let yPosition = tableTop + 40;

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

          const precioUnitarioConIVA = new Decimal(precioConDescuento);
          const precioUnitarioNeto = precioUnitarioConIVA
            .dividedBy(1.21)
            .toDecimalPlaces(2);
          const subTotal = new Decimal(precioUnitarioNeto)
            .mul(item.cantidad)
            .toDecimalPlaces(2);
          const subTotalConIVA = new Decimal(precioUnitarioConIVA)
            .mul(item.cantidad)
            .toDecimalPlaces(2);
          doc
            .font('Helvetica')
            .fontSize(8)
            .text(
              `${item.producto.descripcion} - ${item.producto.marca}`,
              50,
              yPosition,
            )
            .text(item.cantidad.toString(), 297, yPosition)
            .text(`$${precioUnitarioNeto.toFixed(2)}`, 310, yPosition, {
              align: 'right',
              width: 80,
            })
            .text(`$${subTotal.toFixed(2)}`, 370, yPosition, {
              align: 'right',
              width: 80,
            })
            .text('21%', 480, yPosition)
            .font('Helvetica-Bold')
            .text(`$${subTotalConIVA.toFixed(2)}`, 485, yPosition, {
              align: 'right',
              width: 80,
            });

          yPosition += 25;
        });
      }
    } else {
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

      let yPosition = tableTop + 40;

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
            .text(item.cantidad.toString(), 368, yPosition)
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
    }

    doc.moveTo(50, 500).lineTo(565, 500).stroke();
    doc.moveTo(50, 500).lineTo(50, 650).stroke();
    doc.moveTo(565, 500).lineTo(565, 650).stroke();
    doc.moveTo(50, 650).lineTo(565, 650).stroke();

    const importe = new Decimal(data.importeTotal);
    const importeNeto = importe.dividedBy(1.21).toDecimalPlaces(2);
    const importeIVA = importe.minus(importeNeto).toDecimalPlaces(2);

    if (data.tipoComprobante === 'FACTURA B') {
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Subtotal: $', 390, 515, {
          align: 'left',
        })
        .text(`${importe.toFixed(2)}`, 400, 515, {
          align: 'right',
        })

        .text('Importe Otros Tributos: $', 310, 535, {
          align: 'left',
        })
        .text(`0,00`, 400, 535, {
          align: 'right',
        })
        .text('Importe Total: $', 365, 555, {
          align: 'left',
        })
        .text(`${importe.toFixed(2)}`, 400, 555, {
          align: 'right',
        });

      doc
        .fontSize(8)
        .text(
          'Régimen de Transparencia Fiscal Al Consumidor (Ley 27.743)',
          60,
          580,
          { align: 'left' },
        );

      doc.moveTo(60, 590).lineTo(290, 590).stroke({ width: 1 });

      doc
        .font('Helvetica')
        .fontSize(8)
        .text('IVA Contenido: $', 110, 610, { align: 'right', width: 100 })
        .text(`${importeIVA.toFixed(2)}`, 190, 610, {
          align: 'right',
          width: 100,
        })
        .text('Otros Impuestos Nacionales Indirectos: $', 10, 630, {
          align: 'right',
          width: 200,
        })
        .text(`0,00`, 190, 630, {
          align: 'right',
          width: 100,
        });
    } else if (data.tipoComprobante === 'FACTURA A') {
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Importe Neto Gravado: $', 312, 515, {
          align: 'left',
        })
        .text(`${importeNeto.toFixed(2)}`, 400, 515, {
          align: 'right',
        })
        .text('IVA 21%: $', 392, 535, {
          align: 'left',
        })
        .text(`${importeIVA.toFixed(2)}`, 400, 535, {
          align: 'right',
        })
        .text('Importe Otros Tributos: $', 310, 555, {
          align: 'left',
        })
        .text(`0,00`, 400, 555, {
          align: 'right',
        })
        .text('Importe Total: $', 365, 575, {
          align: 'left',
        })
        .text(`${importe.toFixed(2)}`, 400, 575, {
          align: 'right',
        });
    }

    doc.image(qrBuffer, 60, 655, {
      width: 120,
    });

    doc.font('Helvetica-Bold');
    doc.fontSize(10).text('CAE N°: ', 420, 680, {
      align: 'right',
      width: 50,
    });

    doc.fontSize(10).text(data.CAE, 350, 680, {
      align: 'right',
    });

    doc.fontSize(10).text('FECHA VENCIMIENTO: ', 350, 700, {
      align: 'right',
      width: 120,
    });

    doc.fontSize(10).text(data.CAEVencimiento.split('T')[0], 350, 700, {
      align: 'right',
    });
  }

  private enmarcarPDF(doc: PDFDocument) {
    doc.moveTo(50, 10).lineTo(565, 10).stroke();
    doc.moveTo(50, 40).lineTo(565, 40).stroke();

    doc.moveTo(50, 140).lineTo(565, 140).stroke();
    doc.moveTo(50, 230).lineTo(565, 230).stroke();

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
