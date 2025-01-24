import { Controller } from '@nestjs/common';
import { ClienteObraSocialService } from './cliente-obra-social.service';

@Controller('cliente-obra-social')
export class ClienteObraSocialController {
  constructor(
    private readonly clienteObraSocialService: ClienteObraSocialService,
  ) {}
}
