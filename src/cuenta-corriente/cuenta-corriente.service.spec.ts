import { Test, TestingModule } from '@nestjs/testing';
import { CuentaCorrienteService } from './cuenta-corriente.service';

describe('CuentaCorrienteService', () => {
  let service: CuentaCorrienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuentaCorrienteService],
    }).compile();

    service = module.get<CuentaCorrienteService>(CuentaCorrienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
