import { Controller, Get } from '@nestjs/common';
import { FacturadorService } from './services/facturador.service';

@Controller('facturador')
export class FacturadorController {
  constructor(private readonly facturadorService: FacturadorService) {}

  @Get('ultimonumero')
  async getTokens() {
    return this.facturadorService.getLastBillNumber({
      datosUltimoAutorizado: {
        PtoVta: 12,
        CbteTipo: 1,
      },
    });
  }
}
