import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoController } from './movimiento.controller';
import { MovimientoService } from './movimiento.service';

describe('MovimientoController', () => {
  let controller: MovimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientoController],
      providers: [MovimientoService],
    }).compile();

    controller = module.get<MovimientoController>(MovimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
