import { Controller } from '@nestjs/common';
import { LineaVentaService } from './linea-venta.service';

@Controller('linea-venta')
export class LineaVentaController {
  constructor(private readonly LineaVentaService: LineaVentaService) {}
}
