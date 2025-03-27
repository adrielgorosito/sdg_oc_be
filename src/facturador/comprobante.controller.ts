import { Body, Controller, Post } from '@nestjs/common';
import { CrearComprobanteDTO } from './dto/create-comprobante.dto';
import { FacturadorService } from './services/facturador.service';

@Controller('comprobante')
export class ComprobanteController {
  constructor(private readonly facturadorService: FacturadorService) {}

  @Post()
  async create(@Body() createComprobanteDto: CrearComprobanteDTO) {
    return this.facturadorService.crearComprobante(createComprobanteDto);
  }
}
