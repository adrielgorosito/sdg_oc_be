import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraSocial } from '../obra-social/entities/obra-social.entity';
import { VentaObraSocial } from './entities/venta-obra-social.entity';
@Injectable()
export class VentaObraSocialService {
  constructor(
    @InjectRepository(VentaObraSocial)
    private ventaObraSocialRepository: Repository<VentaObraSocial>,
    @InjectRepository(ObraSocial)
    private obraSocialRepository: Repository<ObraSocial>,
  ) {}

  async getReporteOS() {
    try {
      const resultado = await this.ventaObraSocialRepository
        .createQueryBuilder('ventaObraSocial')
        .select('ventaObraSocial.obraSocialId', 'obraSocialId')
        .addSelect('ventaObraSocial.condicionIVA', 'condicionIVA')
        .addSelect('SUM(ventaObraSocial.importe)', 'suma_importe')
        .groupBy('ventaObraSocial.obraSocialId')
        .addGroupBy('ventaObraSocial.condicionIVA')
        .getRawMany();

      console.log(resultado);

      const resultadoProcesado = new Map();

      for (const item of resultado) {
        if (!resultadoProcesado.has(item.obraSocialId)) {
          const obraSocial = await this.obraSocialRepository.findOne({
            where: { id: item.obraSocialId },
          });
          resultadoProcesado.set(item.obraSocialId, {
            obraSocial: { ...obraSocial, condicionesIVA: [] },
          });
        }

        resultadoProcesado
          .get(item.obraSocialId)
          .obraSocial.condicionesIVA.push({
            condicionIVA: item.condicionIVA,
            suma_importe: item.suma_importe,
          });
      }

      return Array.from(resultadoProcesado.values());
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
