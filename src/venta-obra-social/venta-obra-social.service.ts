import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'date-fns';
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

  async getReporteOS(
    obraSocialId?: number,
    fechaDesde?: string,
    fechaHasta?: string,
  ) {
    try {
      const query = this.ventaObraSocialRepository
        .createQueryBuilder('ventaObraSocial')
        .select('ventaObraSocial.obraSocialId', 'obraSocialId')
        .addSelect('ventaObraSocial.condicionIVA', 'condicionIVA')
        .addSelect('SUM(ventaObraSocial.importe)', 'suma_importe')
        .innerJoin('ventaObraSocial.venta', 'venta')
        .groupBy('ventaObraSocial.obraSocialId')
        .addGroupBy('ventaObraSocial.condicionIVA');

      const queryImportes = this.ventaObraSocialRepository
        .createQueryBuilder('ventaObraSocial')
        .select('ventaObraSocial.importe', 'importe')
        .addSelect('ventaObraSocial.condicionIVA', 'condicionIVA')
        .addSelect('ventaObraSocial.obraSocialId', 'obraSocialId')
        .addSelect('venta.fecha', 'fecha')
        .addSelect('cliente.nombre', 'nombre')
        .addSelect('cliente.apellido', 'apellido')
        .innerJoin('ventaObraSocial.venta', 'venta')
        .innerJoin('venta.cliente', 'cliente');

      if (obraSocialId) {
        query.andWhere('ventaObraSocial.obraSocialId = :obraSocialId', {
          obraSocialId,
        });
        queryImportes.andWhere('ventaObraSocial.obraSocialId = :obraSocialId', {
          obraSocialId,
        });
      }
      // Filtro por fecha
      let fechaInicio: Date;
      let fechaFin: Date;

      if (fechaDesde) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde)) {
          throw new BadRequestException(
            `Formato de fechaDesde inválido. Se esperaba 'YYYY-MM-DD'`,
          );
        }
        fechaInicio = parse(fechaDesde, 'yyyy-MM-dd', new Date());
      } else {
        // Si no se proporciona fechaDesde, usamos un mes anterior como predeterminado
        fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      }

      if (fechaHasta) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaHasta)) {
          throw new BadRequestException(
            `Formato de fechaHasta inválido. Se esperaba 'YYYY-MM-DD'`,
          );
        }
        fechaFin = parse(fechaHasta, 'yyyy-MM-dd', new Date());
      }

      if (fechaInicio && fechaFin) {
        query.andWhere('venta.fecha BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio,
          fechaFin,
        });
        queryImportes.andWhere(
          'venta.fecha BETWEEN :fechaInicio AND :fechaFin',
          {
            fechaInicio,
            fechaFin,
          },
        );
      } else if (fechaInicio) {
        query.andWhere('venta.fecha >= :fechaInicio', { fechaInicio });
        queryImportes.andWhere('venta.fecha >= :fechaInicio', { fechaInicio });
      } else if (fechaFin) {
        query.andWhere('venta.fecha <= :fechaFin', { fechaFin });
        queryImportes.andWhere('venta.fecha <= :fechaFin', { fechaFin });
      }
      const resultado = await query.getRawMany();
      const resultadoImportes = await queryImportes.getRawMany();

      const resultadoProcesado = new Map();
      const resultadoProcesadoImportes = new Map();

      resultadoImportes.forEach((item) => {
        if (!resultadoProcesadoImportes.has(item.obraSocialId)) {
          resultadoProcesadoImportes.set(item.obraSocialId, {
            movimientos: [],
          });
        }
        resultadoProcesadoImportes.get(item.obraSocialId).movimientos.push({
          fecha: item.fecha,
          nombreCliente: item.nombre,
          apellidoCliente: item.apellido,
          importe: item.importe,
          condicionIVA: item.condicionIVA,
        });
      });

      console.log(resultadoProcesadoImportes);

      for (const item of resultado) {
        if (!resultadoProcesado.has(item.obraSocialId)) {
          const obraSocial = await this.obraSocialRepository.findOne({
            where: { id: item.obraSocialId },
          });
          resultadoProcesado.set(item.obraSocialId, {
            obraSocial: { ...obraSocial, condicionesIVA: [] },
          });
        }

        const movimientos = resultadoProcesadoImportes
          .get(item.obraSocialId)
          .movimientos.filter(
            (movimiento) => movimiento.condicionIVA === item.condicionIVA,
          );

        resultadoProcesado
          .get(item.obraSocialId)
          .obraSocial.condicionesIVA.push({
            condicionIVA: item.condicionIVA,
            suma_importe: item.suma_importe,
            movimientos: movimientos ?? [],
          });
      }

      return Array.from(resultadoProcesado.values());
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
