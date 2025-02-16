import { Test, TestingModule } from '@nestjs/testing';
import { AudiometriaService } from './audiometria.service';

describe('AudiometriaService', () => {
  let service: AudiometriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AudiometriaService],
    }).compile();

    service = module.get<AudiometriaService>(AudiometriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
