import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateCajaDTO } from './dto/create-caja.dto';

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Get('saldo')
  findMovimientosCaja(@Query('fecha') fecha?: Date) {
    return this.cajaService.findMovimientosCaja(fecha);
  }

  @Get('apertura')
  findAperturaDelDia(@Query('fecha') fecha?: Date) {
    return this.cajaService.findAperturaDelDia(fecha);
  }

  @Get('cierre')
  findCierreDelDia(@Query('fecha') fecha?: Date) {
    return this.cajaService.findCierreDelDia(fecha);
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
