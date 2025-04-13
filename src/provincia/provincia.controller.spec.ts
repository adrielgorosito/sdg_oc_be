import { Test, TestingModule } from '@nestjs/testing';
import { ProvinciaController } from './provincia.controller';
import { ProvinciaService } from './provincia.service';

describe('ProvinciaController', () => {
  let controller: ProvinciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvinciaController],
      providers: [ProvinciaService],
    }).compile();

    controller = module.get<ProvinciaController>(ProvinciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
