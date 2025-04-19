import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDTO } from './dto/create-cliente.dto';
import { PaginateClienteDTO } from './dto/paginate-cliente.dto';
import { UpdateClienteDTO } from './dto/update-cliente.dto';
import { TipoDocumento } from './enums/tipo-documento.enum';

@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  findAll(@Query() paginateClienteDTO: PaginateClienteDTO) {
    return this.clienteService.findAll(paginateClienteDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clienteService.findOne(id);
  }

  @Get('nroDocumento/:nroDocumento/tipoDocumento/:tipoDocumento')
  findByNroDocumento(
    @Param('nroDocumento') nroDocumento: number,
    @Param('tipoDocumento') tipoDocumento: TipoDocumento,
  ) {
    return this.clienteService.findByNroDocumento(nroDocumento, tipoDocumento);
  }

  @Get('get/frecuentes/')
  findFrecuentes() {
    return this.clienteService.findFrecuentes();
  }

  @Post()
  create(@Body() createClienteDto: CreateClienteDTO) {
    return this.clienteService.create(createClienteDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateClienteDto: UpdateClienteDTO) {
    return this.clienteService.update(id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.clienteService.remove(id);
  }

  @Get('recetas/count')
  async getCantidadRecetas() {
    return await this.clienteService.getCantidadRecetas();
  }

  @Get('recetas/:id')
  async getRecetasPorCliente(@Param('id') id: number) {
    return await this.clienteService.getRecetasPorCliente(id);
  }

  @Get('audiometrias/fecha')
  async getUltimaFechaAudiometrias() {
    return await this.clienteService.getUltimaFechaAudiometrias();
  }

  @Get('audiometrias/:id')
  async getAudiometriasPorCliente(@Param('id') id: number) {
    return await this.clienteService.getAudiometriasPorCliente(id);
  }
}
