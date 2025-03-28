import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrearComprobanteDTO } from './dto/create-comprobante.dto';
import { FacturadorService } from './services/facturador.service';

@Controller('comprobante')
export class ComprobanteController {
  constructor(private readonly facturadorService: FacturadorService) {}

  @Get('cliente/:id')
  async findAllByClienteId(@Param('id') clienteId: number) {
    return this.facturadorService.findAllByClienteId(clienteId);
  }

  @Post()
  async create(@Body() createComprobanteDto: CrearComprobanteDTO) {
    return this.facturadorService.crearComprobante(createComprobanteDto);
  }
}
