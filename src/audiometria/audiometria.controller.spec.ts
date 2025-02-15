import { Test, TestingModule } from '@nestjs/testing';
import { AudiometriaController } from './audiometria.controller';
import { AudiometriaService } from './audiometria.service';

describe('AudiometriaController', () => {
  let controller: AudiometriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AudiometriaController],
      providers: [AudiometriaService],
    }).compile();

    controller = module.get<AudiometriaController>(AudiometriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
