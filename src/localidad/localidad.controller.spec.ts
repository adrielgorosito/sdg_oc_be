import { Test, TestingModule } from '@nestjs/testing';
import { LocalidadController } from './localidad.controller';
import { LocalidadService } from './localidad.service';

describe('LocalidadController', () => {
  let controller: LocalidadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalidadController],
      providers: [LocalidadService],
    }).compile();

    controller = module.get<LocalidadController>(LocalidadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
