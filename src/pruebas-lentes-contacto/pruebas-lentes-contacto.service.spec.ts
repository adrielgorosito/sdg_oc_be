import { Test, TestingModule } from '@nestjs/testing';
import { PruebasLentesContactoService } from './pruebas-lentes-contacto.service';

describe('PruebasLentesContactoService', () => {
  let service: PruebasLentesContactoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PruebasLentesContactoService],
    }).compile();

    service = module.get<PruebasLentesContactoService>(PruebasLentesContactoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
