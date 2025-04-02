import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ParametrosService } from 'src/parametros/parametros.service';
import { GeneradorDocumentosService } from './generador-documentos.service';

@Injectable()
export class EmailService {
  private readonly transporter;
  private readonly gmailUser;
  private readonly gmailAppPassword;

  constructor(
    private readonly parametroService: ParametrosService,
    private readonly generadorDocumentosService: GeneradorDocumentosService,
    private readonly configService: ConfigService,
  ) {
    this.gmailUser = this.configService.get<string>('GMAIL_USER');
    this.gmailAppPassword =
      this.configService.get<string>('GMAIL_APP_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.gmailUser,
        pass: this.gmailAppPassword,
      },
    });
  }

  async sendEmail(comprobanteId: string, cliente: Cliente) {
    try {
      const pdf = await this.generadorDocumentosService.imprimirFactura({
        id: comprobanteId,
      });
      console.log(cliente);

      const razonSocialEmpresa = (
        await this.parametroService.getParam('RAZON_SOCIAL_EMPRESA')
      ).value;

      const emailResponse = await this.transporter.sendMail({
        from: `"${razonSocialEmpresa}" <${this.gmailUser}>`,
        to: 'chat.banbra@gmail.com', //cliente.email,
        subject: 'Factura',
        html: `
          <h1>Hola, ${cliente.nombre}!</h1>
          <p>Gracias por tu compra. Adjuntamos la factura de tu compra.</p>
          <p>Si tienes alguna duda, contáctanos en ${this.gmailUser}.</p>
          <footer>
            <b>${razonSocialEmpresa}</b>
          </footer>
        `,
        attachments: [
          {
            filename: `factura_${comprobanteId}.pdf`,
            content: pdf.pdfOriginal,
            contentType: 'application/pdf',
          },
        ],
      });

      return emailResponse;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error al enviar el email: ' + error.message,
      );
    }
  }
}
