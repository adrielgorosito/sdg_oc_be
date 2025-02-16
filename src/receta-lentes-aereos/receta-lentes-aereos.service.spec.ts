import { Test, TestingModule } from '@nestjs/testing';
import { RecetaLentesAereosService } from './receta-lentes-aereos.service';

describe('RecetaLentesAereosService', () => {
  let service: RecetaLentesAereosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecetaLentesAereosService],
    }).compile();

    service = module.get<RecetaLentesAereosService>(RecetaLentesAereosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
