import { Test, TestingModule } from '@nestjs/testing';
import { VentasService } from './ventas.service';

describe('VentasService', () => {
  let service: VentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentasService],
    }).compile();

    service = module.get<VentasService>(VentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
