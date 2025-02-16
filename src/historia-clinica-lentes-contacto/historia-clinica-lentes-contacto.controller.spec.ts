import { Test, TestingModule } from '@nestjs/testing';
import { HistoriaClinicaLentesContactoController } from './historia-clinica-lentes-contacto.controller';
import { HistoriaClinicaLentesContactoService } from './historia-clinica-lentes-contacto.service';

describe('HistoriaClinicaLentesContactoController', () => {
  let controller: HistoriaClinicaLentesContactoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoriaClinicaLentesContactoController],
      providers: [HistoriaClinicaLentesContactoService],
    }).compile();

    controller = module.get<HistoriaClinicaLentesContactoController>(HistoriaClinicaLentesContactoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
