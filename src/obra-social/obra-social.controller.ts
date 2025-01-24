import { Controller } from '@nestjs/common';
import { ObraSocialService } from './obra-social.service';

@Controller('obra-social')
export class ObraSocialController {
  constructor(private readonly obraSocialService: ObraSocialService) {}
}
