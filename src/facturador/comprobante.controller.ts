import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CrearComprobanteDTO } from './dto/create-comprobante.dto';
import { PaginateComprobanteDTO } from './dto/paginate-comprobante.dto';
import { FacturadorService } from './services/facturador.service';
import { GeneradorDocumentosService } from './services/generador-documentos.service';
@Controller('comprobante')
export class ComprobanteController {
  constructor(
    private readonly facturadorService: FacturadorService,
    private readonly generadorDocumentosService: GeneradorDocumentosService,
  ) {}

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

  @Post('imprimir')
  @Header('Content-Type', 'application/pdf')
  async imprimirFactura(@Body() data: any, @Res() res: Response) {
    const { pdfOriginal } =
      await this.generadorDocumentosService.imprimirFactura(data);
    res.send(pdfOriginal);
  }
}
