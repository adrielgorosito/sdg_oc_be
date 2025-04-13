import { Test, TestingModule } from '@nestjs/testing';
import { DetallesRecetaLentesAereosController } from './detalles-receta-lentes-aereos.controller';
import { DetallesRecetaLentesAereosService } from './detalles-receta-lentes-aereos.service';

describe('DetalleRecetaLentesAereosController', () => {
  let controller: DetallesRecetaLentesAereosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetallesRecetaLentesAereosController],
      providers: [DetallesRecetaLentesAereosService],
    }).compile();

    controller = module.get<DetallesRecetaLentesAereosController>(
      DetallesRecetaLentesAereosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
