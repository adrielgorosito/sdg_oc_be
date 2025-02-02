import { Controller } from '@nestjs/common';
import { MovimientoService } from './movimiento.service';

@Controller('movimiento')
export class MovimientoController {
  constructor(private readonly movimientoService: MovimientoService) {}
}
