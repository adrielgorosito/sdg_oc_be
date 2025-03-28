import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMovimientoDTO } from 'src/movimiento/dto/create-movimiento.dto';
import { CuentaCorrienteService } from './cuenta-corriente.service';
import { CreateCuentaCorrienteDTO } from './dto/create-cuenta-corriente.dto';
import { UpdateCuentaCorrienteDTO } from './dto/update-cuenta-corriente.dto';

@Controller('cuenta-corriente')
export class CuentaCorrienteController {
  constructor(
    private readonly cuentaCorrienteService: CuentaCorrienteService,
  ) {}

  @Get()
  async findAll() {
    return await this.cuentaCorrienteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.cuentaCorrienteService.findOne(id);
  }

  @Post()
  async create(@Body() ccDTO: CreateCuentaCorrienteDTO) {
    return await this.cuentaCorrienteService.create(ccDTO);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() ccDTO: UpdateCuentaCorrienteDTO,
  ) {
    return await this.cuentaCorrienteService.update(id, ccDTO);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.cuentaCorrienteService.remove(id);
  }

  @Patch('cliente/:clienteId')
  async afectarCuentaCorriente(
    @Param('clienteId') clienteId: number,
    @Body() movimientoDTO: CreateMovimientoDTO,
  ) {
    return await this.cuentaCorrienteService.afectarCuentaCorriente(
      clienteId,
      movimientoDTO.importe,
      movimientoDTO.tipoMovimiento,
    );
  }

  @Get('cliente/:id')
  async findOneByClienteId(@Param('id') id: number) {
    return await this.cuentaCorrienteService.findOneByClienteId(id);
  }
}
