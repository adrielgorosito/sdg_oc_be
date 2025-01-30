import { PartialType } from '@nestjs/mapped-types';
import { CreateProveedorDTO } from './create-proveedor.dto';

export class UpdateProveedorDTO extends PartialType(CreateProveedorDTO) {}
