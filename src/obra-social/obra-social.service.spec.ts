import { Test, TestingModule } from '@nestjs/testing';
import { ObraSocialService } from './obra-social.service';

describe('ObraSocialService', () => {
  let service: ObraSocialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObraSocialService],
    }).compile();

    service = module.get<ObraSocialService>(ObraSocialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
