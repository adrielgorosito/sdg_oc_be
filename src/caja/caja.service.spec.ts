import { Test, TestingModule } from '@nestjs/testing';
import { CajaService } from './caja.service';

describe('CajaService', () => {
  let service: CajaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CajaService],
    }).compile();

    service = module.get<CajaService>(CajaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
