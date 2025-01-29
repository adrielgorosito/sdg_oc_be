import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CuentaCorrienteService } from './cuenta-corriente.service';
import { CuentaCorrienteDTO } from './dto/cuenta-corriente.dto';

@Controller('cuenta-corriente')
export class CuentaCorrienteController {
  constructor(
    private readonly cuentaCorrienteService: CuentaCorrienteService,
  ) {}

  @Get()
  async findAll() {
    return await this.cuentaCorrienteService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: number) {
    return await this.cuentaCorrienteService.findOne(id);
  }

  @Post()
  async create(@Body() ccDTO: CuentaCorrienteDTO) {
    return await this.cuentaCorrienteService.create(ccDTO);
  }

  @Patch('/:id')
  async update(@Param('id') id: number, @Body() ccDTO: CuentaCorrienteDTO) {
    return await this.cuentaCorrienteService.update(id, ccDTO.saldo);
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: number) {
    return await this.cuentaCorrienteService.delete(id);
  }
}
