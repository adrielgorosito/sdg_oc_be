import { Test, TestingModule } from '@nestjs/testing';
import { ProvinciaService } from './provincia.service';

describe('ProvinciaService', () => {
  let service: ProvinciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvinciaService],
    }).compile();

    service = module.get<ProvinciaService>(ProvinciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
