import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ClienteService } from 'src/cliente/cliente.service';
import { ParametrosService } from 'src/parametros/parametros.service';
import { EmailDataDTO } from '../dto/email-data.dto';
import { GeneradorDocumentosService } from './generador-documentos.service';
@Injectable()
export class EmailService {
  private readonly transporter;
  private readonly gmailUser;
  private readonly gmailAppPassword;

  constructor(
    private readonly parametroService: ParametrosService,
    private readonly generadorDocumentosService: GeneradorDocumentosService,
    private readonly clienteService: ClienteService,
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

  async sendEmail(emailData: EmailDataDTO) {
    try {
      const { pdfOriginal, pdfDuplicado, comprobante } =
        await this.generadorDocumentosService.imprimirFactura({
          id: emailData.comprobante.id,
        });

      const cliente =
        comprobante.venta?.cliente ??
        comprobante.facturaRelacionada?.venta?.cliente;

      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      } else {
        const emailTo = emailData.email || cliente.email;

        const razonSocialEmpresa = (
          await this.parametroService.getParam('RAZON_SOCIAL_EMPRESA')
        ).value;

        const emailResponse = await this.transporter.sendMail({
          from: `"${razonSocialEmpresa}" <${this.gmailUser}>`,
          to: 'chat.banbra@gmail.com', //emailTo,
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
              filename: `factura_${cliente.apellido}_${cliente.nombre}.pdf`,
              content: pdfOriginal,
              contentType: 'application/pdf',
            },
          ],
        });

        return {
          emailResponse,
          comprobante,
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);

      throw new InternalServerErrorException(
        'Error al enviar el email: ' + error.message,
      );
    }
  }
}
