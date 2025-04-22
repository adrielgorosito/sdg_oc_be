import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
      let fechaInicio: Date;
      let fechaFin: Date;

      const whereParams: Record<string, any> = {};
      if (obraSocialId) whereParams.obraSocialId = obraSocialId;
      if (fechaInicio) whereParams.fechaInicio = fechaInicio;
      if (fechaFin) whereParams.fechaFin = fechaFin;

      // Query agregada
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
        .select([
          'ventaObraSocial.importe AS importe',
          'ventaObraSocial.condicionIVA AS condicionIVA',
          'ventaObraSocial.obraSocialId AS obraSocialId',
          'venta.fecha AS fecha',
          'venta.id AS ventaId',
          'cliente.nombre AS nombre',
          'cliente.apellido AS apellido',
        ])
        .innerJoin('ventaObraSocial.venta', 'venta')
        .innerJoin('venta.cliente', 'cliente');

      if (whereParams.obraSocialId) {
        query.andWhere(
          'ventaObraSocial.obraSocialId = :obraSocialId',
          whereParams,
        );
        queryImportes.andWhere(
          'ventaObraSocial.obraSocialId = :obraSocialId',
          whereParams,
        );
      }
      if (fechaDesde) {
        const fechaDesdeDate = new Date(fechaDesde + 'T00:00:00-03:00');
        whereParams.fechaDesde = fechaDesdeDate;
      }
      if (fechaHasta) {
        const fechaHastaDate = new Date(fechaHasta + 'T23:59:59-03:00');
        whereParams.fechaHasta = fechaHastaDate;
      }

      if (fechaDesde && fechaHasta) {
        query.andWhere(
          'venta.fecha BETWEEN :fechaDesde AND :fechaHasta',
          whereParams,
        );
        queryImportes.andWhere(
          'venta.fecha BETWEEN :fechaDesde AND :fechaHasta',
          whereParams,
        );
      } else if (fechaDesde) {
        query.andWhere('venta.fecha >= :fechaDesde', whereParams);
        queryImportes.andWhere('venta.fecha >= :fechaDesde', whereParams);
      } else if (fechaHasta) {
        query.andWhere('venta.fecha <= :fechaHasta', whereParams);
        queryImportes.andWhere('venta.fecha <= :fechaHasta', whereParams);
      }

      const [resultado, resultadoImportes] = await Promise.all([
        query.getRawMany(),
        queryImportes.getRawMany(),
      ]);

      const movimientosMap = new Map<string, any>();

      for (const item of resultadoImportes) {
        const key = `${item.obraSocialId}-${item.condicionIVA}`;
        if (!movimientosMap.has(key)) {
          movimientosMap.set(key, []);
        }
        movimientosMap.get(key).push({
          fecha: item.fecha,
          nombreCliente: item.nombre,
          apellidoCliente: item.apellido,
          importe: item.importe,
          condicionIVA: item.condicionIVA,
          ventaId: item.ventaId,
        });
      }

      // Obtenemos todas las obras sociales en una sola query
      const obrasSocialesIds = [
        ...new Set(resultado.map((r) => r.obraSocialId)),
      ];
      const obrasSociales = await this.obraSocialRepository.findBy({
        id: In(obrasSocialesIds),
      });

      // Creamos un mapa para acceso rápido
      const obrasSocialesMap = new Map(obrasSociales.map((o) => [o.id, o]));

      const resultadoProcesado = [];

      for (const item of resultado) {
        const obraSocial = obrasSocialesMap.get(item.obraSocialId);
        const key = `${item.obraSocialId}-${item.condicionIVA}`;
        const movimientos = movimientosMap.get(key) ?? [];

        let entrada = resultadoProcesado.find(
          (r) => r.obraSocial.id === item.obraSocialId,
        );

        if (!entrada) {
          entrada = {
            obraSocial: { ...obraSocial, condicionesIVA: [] },
          };
          resultadoProcesado.push(entrada);
        }

        entrada.obraSocial.condicionesIVA.push({
          condicionIVA: item.condicionIVA,
          suma_importe: item.suma_importe,
          movimientos,
        });
      }

      return resultadoProcesado;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el reporte de ventas por obra social' + error.message,
      );
    }
  }
}
