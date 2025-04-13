import { Test, TestingModule } from '@nestjs/testing';
import { CuentaCorrienteController } from './cuenta-corriente.controller';
import { CuentaCorrienteService } from './cuenta-corriente.service';

describe('CuentaCorrienteController', () => {
  let controller: CuentaCorrienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentaCorrienteController],
      providers: [CuentaCorrienteService],
    }).compile();

    controller = module.get<CuentaCorrienteController>(CuentaCorrienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
