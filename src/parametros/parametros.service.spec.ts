import { Test, TestingModule } from '@nestjs/testing';
import { ParametrosService } from './parametros.service';

describe('ParametrosService', () => {
  let service: ParametrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParametrosService],
    }).compile();

    service = module.get<ParametrosService>(ParametrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
