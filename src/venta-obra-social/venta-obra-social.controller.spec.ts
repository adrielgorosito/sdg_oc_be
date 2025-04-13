import { Test, TestingModule } from '@nestjs/testing';
import { VentaObraSocialController } from './venta-obra-social.controller';
import { VentaObraSocialService } from './venta-obra-social.service';

describe('VentaObraSocialController', () => {
  let controller: VentaObraSocialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentaObraSocialController],
      providers: [VentaObraSocialService],
    }).compile();

    controller = module.get<VentaObraSocialController>(VentaObraSocialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
