import { Controller } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';

@Controller('proveedor')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}
}
