import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDTO } from './dto/create-cliente.dto';
import { UpdateClienteDTO } from './dto/update-cliente.dto';
@Controller('cliente')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.clienteService.findOne(id);
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
}
