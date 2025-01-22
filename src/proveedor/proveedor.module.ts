import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';

@Module({
  controllers: [ProveedorController],
  providers: [ProveedorService],
})
export class ProveedorModule {}
