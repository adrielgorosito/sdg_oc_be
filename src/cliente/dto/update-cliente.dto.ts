import { PartialType } from '@nestjs/mapped-types';
import { CreateClienteDTO } from './create-cliente.dto';

export class UpdateClienteDTO extends PartialType(CreateClienteDTO) {}
