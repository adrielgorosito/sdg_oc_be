import { Test, TestingModule } from '@nestjs/testing';
import { LineaVentaService } from './linea-venta.service';

describe('LineaVentaService', () => {
  let service: LineaVentaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LineaVentaService],
    }).compile();

    service = module.get<LineaVentaService>(LineaVentaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
