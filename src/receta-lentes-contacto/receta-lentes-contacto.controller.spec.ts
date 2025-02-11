import { Test, TestingModule } from '@nestjs/testing';
import { RecetaLentesContactoController } from './receta-lentes-contacto.controller';
import { RecetaLentesContactoService } from './receta-lentes-contacto.service';

describe('RecetaLentesContactoController', () => {
  let controller: RecetaLentesContactoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecetaLentesContactoController],
      providers: [RecetaLentesContactoService],
    }).compile();

    controller = module.get<RecetaLentesContactoController>(RecetaLentesContactoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
