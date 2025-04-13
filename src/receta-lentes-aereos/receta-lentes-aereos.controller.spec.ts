import { Test, TestingModule } from '@nestjs/testing';
import { RecetaLentesAereosController } from './receta-lentes-aereos.controller';
import { RecetaLentesAereosService } from './receta-lentes-aereos.service';

describe('RecetaLentesAereosController', () => {
  let controller: RecetaLentesAereosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecetaLentesAereosController],
      providers: [RecetaLentesAereosService],
    }).compile();

    controller = module.get<RecetaLentesAereosController>(RecetaLentesAereosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
