import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CreateMovimientoDTO } from 'src/movimiento/dto/create-movimiento.dto';
import { CuentaCorrienteService } from './cuenta-corriente.service';
import { PaginateCCDTO } from './dto/paginate-cc.dto';

@Controller('cuenta-corriente')
export class CuentaCorrienteController {
  constructor(
    private readonly cuentaCorrienteService: CuentaCorrienteService,
  ) {}

  @Get()
  async findAll(@Query() paginateCCDTO: PaginateCCDTO) {
    return await this.cuentaCorrienteService.findAll(paginateCCDTO);
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
      movimientoDTO,
    );
  }

  @Get('cliente/:id')
  async findOneByClienteId(@Param('id') id: number) {
    return await this.cuentaCorrienteService.findOneByClienteId(id);
  }
}
