import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoService } from './movimiento.service';

describe('MovimientoService', () => {
  let service: MovimientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientoService],
    }).compile();

    service = module.get<MovimientoService>(MovimientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
