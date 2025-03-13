import { Test, TestingModule } from '@nestjs/testing';
import { VentaObraSocialService } from './venta-obra-social.service';

describe('VentaObraSocialService', () => {
  let service: VentaObraSocialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentaObraSocialService],
    }).compile();

    service = module.get<VentaObraSocialService>(VentaObraSocialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
