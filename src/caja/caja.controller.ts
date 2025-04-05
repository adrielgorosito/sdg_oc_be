import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { parse } from 'date-fns';
import { CajaService } from './caja.service';
import { CreateCajaDTO } from './dto/create-caja.dto';

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('saldo')
  findMovimientosCaja(@Query('fecha') fecha?: Date) {
    if (!fecha) {
      fecha = parse(
        new Date().toISOString().split('T')[0],
        'yyyy-MM-dd',
        new Date(),
      );
    }

    return this.cajaService.findMovimientosCaja(fecha);
  }

  @Get('apertura')
  findAperturaDelDia(@Query('fecha') fecha?: Date) {
    if (!fecha) {
      fecha = parse(
        new Date().toISOString().split('T')[0],
        'yyyy-MM-dd',
        new Date(),
      );
    }

    return this.cajaService.findAperturaDelDia(fecha);
  }

  @Post()
  ingresoEgresoCaja(@Body() createCajaDto: CreateCajaDTO) {
    return this.cajaService.extraccionIngresoDinero(createCajaDto);
  }

  @Post('apertura')
  aperturaCaja(@Body() createCajaDto: CreateCajaDTO) {
    return this.cajaService.extraccionIngresoDinero({
      ...createCajaDto,
      detalle: 'APERTURA',
    });
  }

  @Post('cierre')
  cierreCaja(@Body() createCajaDto: CreateCajaDTO) {
    return this.cajaService.extraccionIngresoDinero({
      ...createCajaDto,
      detalle: 'CIERRE',
    });
  }
}
