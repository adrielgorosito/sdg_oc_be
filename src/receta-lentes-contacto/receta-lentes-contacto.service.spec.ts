import { Test, TestingModule } from '@nestjs/testing';
import { RecetaLentesContactoService } from './receta-lentes-contacto.service';

describe('RecetaLentesContactoService', () => {
  let service: RecetaLentesContactoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecetaLentesContactoService],
    }).compile();

    service = module.get<RecetaLentesContactoService>(RecetaLentesContactoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
