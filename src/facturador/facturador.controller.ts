import { Controller, Get } from '@nestjs/common';
import { AfipService } from './services/afip.service';
import { FacturadorService } from './services/facturador.service';

@Controller('facturador')
export class FacturadorController {
  constructor(
    private readonly facturadorService: FacturadorService,
    private readonly afipService: AfipService,
  ) {}

  @Get('ultimonumero')
  async getUltimoNumero() {
    return this.facturadorService.getLastBillNumber({
      PtoVta: 12,
      CbteTipo: 1,
    });
  }
  @Get('facturar')
  async facturar() {
    return this.facturadorService.createBill();
  }
}
