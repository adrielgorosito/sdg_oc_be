import { Test, TestingModule } from '@nestjs/testing';
import { ClienteObraSocialController } from './cliente-obra-social.controller';
import { ClienteObraSocialService } from './cliente-obra-social.service';

describe('ClienteObraSocialController', () => {
  let controller: ClienteObraSocialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClienteObraSocialController],
      providers: [ClienteObraSocialService],
    }).compile();

    controller = module.get<ClienteObraSocialController>(ClienteObraSocialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
