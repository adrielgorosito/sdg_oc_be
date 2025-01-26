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
import { ClienteObraSocialService } from './cliente-obra-social.service';
import { ClienteObraSocialDTO } from './dto/cliente-obra-social.dto';

@Controller('cliente-obra-social')
export class ClienteObraSocialController {
  constructor(
    private readonly clienteObraSocialService: ClienteObraSocialService,
  ) {}

  @Get()
  async findAll(
    @Query('idCliente') idCliente: number,
    @Query('idObraSocial') idObraSocial: number,
  ) {
    return await this.clienteObraSocialService.findAll(idCliente, idObraSocial);
  }

  @Get('/:id')
  async findOneById(@Param('id') id: number) {
    return await this.clienteObraSocialService.findOneById(id);
  }

  @Post()
  async createOne(@Body() cliObSocDTO: ClienteObraSocialDTO) {
    return await this.clienteObraSocialService.create(cliObSocDTO);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: number,
    @Body() updateNroSocio: { nroSocio: number },
  ) {
    return await this.clienteObraSocialService.update(
      id,
      updateNroSocio.nroSocio,
    );
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: number) {
    return await this.clienteObraSocialService.delete(id);
  }
}
