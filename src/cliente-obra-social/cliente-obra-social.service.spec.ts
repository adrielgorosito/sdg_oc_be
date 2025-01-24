import { Test, TestingModule } from '@nestjs/testing';
import { ClienteObraSocialService } from './cliente-obra-social.service';

describe('ClienteObraSocialService', () => {
  let service: ClienteObraSocialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClienteObraSocialService],
    }).compile();

    service = module.get<ClienteObraSocialService>(ClienteObraSocialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
