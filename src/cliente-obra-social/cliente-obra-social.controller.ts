import { ClienteObraSocialService } from './cliente-obra-social.service';
import { CreateClienteObraSocialDTO } from './dto/create-cliente-obra-social.dto';
import { UpdateClienteObraSocialDTO } from './dto/update-cliente-obra-social.dto';
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

@Controller('cliente-obra-social')
export class ClienteObraSocialController {
  constructor(private readonly cliObSocService: ClienteObraSocialService) {}

  @Get()
  async findAll(
    @Query('idCliente') idCliente: number,
    @Query('idObraSocial') idObraSocial: number,
  ) {
    return await this.cliObSocService.findAll(idCliente, idObraSocial);
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.cliObSocService.findOne(id);
  }

  @Post()
  async create(@Body() cliObSocDTO: CreateClienteObraSocialDTO) {
    return await this.cliObSocService.create(cliObSocDTO);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: number,
    @Body() cliObSoc: UpdateClienteObraSocialDTO,
  ) {
    return await this.cliObSocService.update(id, cliObSoc);
  }

  @Delete('/:id')
  async remove(@Param('id') id: number) {
    return await this.cliObSocService.remove(id);
  }
}
