import { Test, TestingModule } from '@nestjs/testing';
import { LineaVentaController } from './linea-venta.controller';
import { LineaVentaService } from './linea-venta.service';

describe('LineaVentaController', () => {
  let controller: LineaVentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LineaVentaController],
      providers: [LineaVentaService],
    }).compile();

    controller = module.get<LineaVentaController>(LineaVentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
