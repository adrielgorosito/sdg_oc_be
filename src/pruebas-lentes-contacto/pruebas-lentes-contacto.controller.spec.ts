import { Test, TestingModule } from '@nestjs/testing';
import { PruebasLentesContactoController } from './pruebas-lentes-contacto.controller';
import { PruebasLentesContactoService } from './pruebas-lentes-contacto.service';

describe('PruebasLentesContactoController', () => {
  let controller: PruebasLentesContactoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PruebasLentesContactoController],
      providers: [PruebasLentesContactoService],
    }).compile();

    controller = module.get<PruebasLentesContactoController>(PruebasLentesContactoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
