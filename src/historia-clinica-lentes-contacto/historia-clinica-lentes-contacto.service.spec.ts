import { Test, TestingModule } from '@nestjs/testing';
import { HistoriaClinicaLentesContactoService } from './historia-clinica-lentes-contacto.service';

describe('HistoriaClinicaLentesContactoService', () => {
  let service: HistoriaClinicaLentesContactoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoriaClinicaLentesContactoService],
    }).compile();

    service = module.get<HistoriaClinicaLentesContactoService>(HistoriaClinicaLentesContactoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
