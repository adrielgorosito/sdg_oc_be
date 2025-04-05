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
import { RelationTransactionalDTO } from 'src/common/dtos/relation-transactional.dto';
import { EmailService } from 'src/comprobante/services/email.service';
import { CrearComprobanteDTO } from './dto/create-comprobante.dto';
import { EmailDataDTO } from './dto/email-data.dto';
import { PaginateComprobanteDTO } from './dto/paginate-comprobante.dto';
import { ComprobanteService } from './services/comprobante.service';
import { GeneradorDocumentosService } from './services/generador-documentos.service';
@Controller('comprobante')
export class ComprobanteController {
  constructor(
    private readonly comprobanteService: ComprobanteService,
    private readonly generadorDocumentosService: GeneradorDocumentosService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  async findAllComprobantes(
    @Query() paginateComprobanteDTO: PaginateComprobanteDTO,
  ) {
    return this.comprobanteService.findAllComprobantes(paginateComprobanteDTO);
  }

  @Get('facturas')
  async findAllFacturas(
    @Query() paginateComprobanteDTO: PaginateComprobanteDTO,
  ) {
    return this.comprobanteService.findAllFacturas(paginateComprobanteDTO);
  }

  @Get('cliente/:id')
  async findAllByClienteId(@Param('id') clienteId: number) {
    return this.comprobanteService.findAllByClienteId(clienteId);
  }

  @Get('venta/:id')
  async findAllComprobantesByVentaId(@Param('id') ventaId: string) {
    return this.comprobanteService.findComprobantesRelacionadosByVenta(ventaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.comprobanteService.findOne(id);
  }

  @Post()
  async create(@Body() createComprobanteDto: CrearComprobanteDTO) {
    return this.comprobanteService.crearComprobante(createComprobanteDto);
  }

  @Post('imprimir')
  @Header('Content-Type', 'application/pdf')
  async imprimirFactura(
    @Body() data: RelationTransactionalDTO,
    @Res() res: Response,
  ) {
    const { pdfOriginal, pdfDuplicado } =
      await this.generadorDocumentosService.imprimirFactura(data);
    res.send(pdfOriginal);
  }

  @Post('email')
  async enviarEmail(@Body() data: EmailDataDTO) {
    return this.emailService.sendEmail(data);
  }
}
