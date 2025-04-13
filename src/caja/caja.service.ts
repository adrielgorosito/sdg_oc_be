import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  RedDePago,
  TipoMedioDePagoEnum,
} from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { Venta } from 'src/venta/entities/venta.entity';
import { EntityManager, Raw, Repository } from 'typeorm';
import { CreateCajaDTO } from './dto/create-caja.dto';
import { Caja } from './entities/caja.entity';
@Injectable()
export class CajaService {
  constructor(
    @InjectRepository(Caja)
    private cajaRepository: Repository<Caja>,
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
  ) {}

  async findMovimientosCaja(fechaParam: Date) {
    try {
      fechaParam = await this.validarFormatoFecha(fechaParam);

      const movimientos = (
        await this.cajaRepository.find({
          where: {
            fechaMovimiento: Raw((alias) => `CAST(${alias} AS DATE) = :fecha`, {
              fecha: fechaParam,
            }),
          },
          order: {
            fechaMovimiento: 'DESC',
          },
        })
      ).map((movimiento) => {
        delete movimiento.id;
        return movimiento;
      });

      const ventas = await this.ventaRepository.find({
        where: {
          fecha: Raw((alias) => `CAST(${alias} AS DATE) = :fecha`, {
            fecha: fechaParam,
          }),
        },
        relations: {
          mediosDePago: true,
        },
      });

      const mediosDePago = ventas
        .flatMap((venta) =>
          venta.mediosDePago.map((mp) => ({
            ...mp,
            fecha: venta.fecha,
          })),
        )
        .map((mediopago) => {
          return {
            fechaMovimiento: mediopago.fecha,
            detalle: 'VENTA',
            importe: mediopago.importe,
            formaPago: mediopago.tipoMedioDePago,
            redDePago: mediopago.redDePago,
          };
        });

      const cajaFinal = [...movimientos, ...mediosDePago];

      const cajaEfectivo = cajaFinal
        .filter(
          (movimiento) => movimiento.formaPago === TipoMedioDePagoEnum.EFECTIVO,
        )
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaTransferencia = cajaFinal
        .filter(
          (movimiento) =>
            movimiento.formaPago === TipoMedioDePagoEnum.TRANSFERENCIA_BANCARIA,
        )
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaCheque = cajaFinal
        .filter(
          (movimiento) => movimiento.formaPago === TipoMedioDePagoEnum.CHEQUE,
        )
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaCuentaCorriente = cajaFinal
        .filter(
          (movimiento) =>
            movimiento.formaPago === TipoMedioDePagoEnum.CUENTA_CORRIENTE,
        )
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaOtro = cajaFinal
        .filter(
          (movimiento) => movimiento.formaPago === TipoMedioDePagoEnum.OTRO,
        )
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaVisa = cajaFinal
        .filter((movimiento) => movimiento.redDePago === RedDePago.VISA)
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaMastercard = cajaFinal
        .filter((movimiento) => movimiento.redDePago === RedDePago.MASTERCARD)
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaAmericanExpress = cajaFinal
        .filter(
          (movimiento) => movimiento.redDePago === RedDePago.AMERICAN_EXPRESS,
        )
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaNaranja = cajaFinal
        .filter((movimiento) => movimiento.redDePago === RedDePago.NARANJA)
        .reduce((acc, curr) => acc + curr.importe, 0);
      const cajaPagofacil = cajaFinal
        .filter((movimiento) => movimiento.redDePago === RedDePago.PAGOFACIL)
        .reduce((acc, curr) => acc + curr.importe, 0);

      const total = cajaFinal.reduce((acc, curr) => acc + curr.importe, 0);

      return {
        cajaFinal,
        cajaEfectivo,
        cajaTransferencia,
        cajaCheque,
        cajaCuentaCorriente,
        cajaOtro,
        cajaVisa,
        cajaMastercard,
        cajaAmericanExpress,
        cajaNaranja,
        cajaPagofacil,
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAperturaDelDia(fechaParam: Date) {
    try {
      fechaParam = await this.validarFormatoFecha(fechaParam);
      const apertura = await this.cajaRepository.findOne({
        where: {
          fechaMovimiento: Raw((alias) => `CAST(${alias} AS DATE) = :fecha`, {
            fecha: fechaParam,
          }),
          detalle: 'APERTURA',
        },
      });

      return apertura;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new InternalServerErrorException(error);
    }
  }

  async findCierreDelDia(fechaParam: Date) {
    try {
      fechaParam = await this.validarFormatoFecha(fechaParam);

      const cierre = await this.cajaRepository.findOne({
        where: {
          fechaMovimiento: Raw((alias) => `CAST(${alias} AS DATE) = :fecha`, {
            fecha: fechaParam,
          }),
          detalle: 'CIERRE',
        },
      });

      return cierre;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createMovimientoCaja(cajas: Caja[], entityManager: EntityManager) {
    try {
      const apertura = await this.findAperturaDelDia(null);

      if (!apertura) {
        throw new BadRequestException('No hubo apertura del día');
      }

      await entityManager.save(Caja, cajas);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  async extraccionIngresoDinero(createCajaDTO: CreateCajaDTO) {
    try {
      if (createCajaDTO.detalle !== 'APERTURA') {
        const apertura = await this.findAperturaDelDia(null);

        if (!apertura) {
          throw new BadRequestException('No hubo apertura del día');
        }

        if (createCajaDTO.detalle === 'CIERRE') {
          const cierre = await this.findCierreDelDia(null);

          if (cierre) {
            throw new BadRequestException('Ya hubo un cierre del día');
          }
        }
      } else {
        const apertura = await this.findAperturaDelDia(null);

        if (apertura) {
          throw new BadRequestException('Ya hubo una apertura del día');
        }
      }
      const caja = this.cajaRepository.create(createCajaDTO);
      caja.formaPago = TipoMedioDePagoEnum.EFECTIVO;

      return await this.cajaRepository.save(caja);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      throw new InternalServerErrorException(error);
    }
  }

  private async validarFormatoFecha(fechaParam?: Date) {
    let fecha: Date;
    if (!fechaParam) {
      fecha = new Date();
      fecha.setHours(0, 0, 0, 0);
    } else {
      fecha = new Date(new Date(fechaParam).setUTCHours(3, 0, 0, 0));
    }

    return fecha;
  }

  @Cron('0 41 18 * * *')
  async handleCron() {
    const apertura = await this.findAperturaDelDia(null);
    const cierre = await this.findCierreDelDia(null);

    if (apertura && !cierre) {
      await this.extraccionIngresoDinero({
        detalle: 'CIERRE',
        importe: 0,
      });
    }
  }
}
