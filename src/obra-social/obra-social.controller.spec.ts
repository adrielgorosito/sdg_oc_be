import { Test, TestingModule } from '@nestjs/testing';
import { ObraSocialController } from './obra-social.controller';
import { ObraSocialService } from './obra-social.service';

describe('ObraSocialController', () => {
  let controller: ObraSocialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObraSocialController],
      providers: [ObraSocialService],
    }).compile();

    controller = module.get<ObraSocialController>(ObraSocialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
