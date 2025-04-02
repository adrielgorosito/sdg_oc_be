import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CreateMovimientoDTO } from 'src/movimiento/dto/create-movimiento.dto';
import { CuentaCorrienteService } from './cuenta-corriente.service';

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
