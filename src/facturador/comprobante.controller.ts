import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CrearComprobanteDTO } from './dto/create-comprobante.dto';
import { PaginateComprobanteDTO } from './dto/paginate-comprobante.dto';
import { FacturadorService } from './services/facturador.service';

@Controller('comprobante')
export class ComprobanteController {
  constructor(private readonly facturadorService: FacturadorService) {}

  @Get()
  async findAll(@Query() paginateComprobanteDTO: PaginateComprobanteDTO) {
    return this.facturadorService.findAllComprobantes(paginateComprobanteDTO);
  }

  @Get('cliente/:id')
  async findAllByClienteId(@Param('id') clienteId: number) {
    return this.facturadorService.findAllByClienteId(clienteId);
  }

  @Post()
  async create(@Body() createComprobanteDto: CrearComprobanteDTO) {
    return this.facturadorService.crearComprobante(createComprobanteDto);
  }
}
