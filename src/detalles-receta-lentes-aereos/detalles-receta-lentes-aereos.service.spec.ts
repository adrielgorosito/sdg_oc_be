import { Test, TestingModule } from '@nestjs/testing';
import { DetallesRecetaLentesAereosService } from './detalles-receta-lentes-aereos.service';

describe('DetallesRecetaLentesAereosService', () => {
  let service: DetallesRecetaLentesAereosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetallesRecetaLentesAereosService],
    }).compile();

    service = module.get<DetallesRecetaLentesAereosService>(
      DetallesRecetaLentesAereosService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
