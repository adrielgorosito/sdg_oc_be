import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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

      const ventasFormateadas = ventas.map((venta) => {
        return {
          id: venta.id,
          fechaMovimiento: venta.fecha,
          detalle: venta.mediosDePago.map((mp) => {
            return {
              importe: mp.importe,
              formaPago: mp.tipoMedioDePago,
              redDePago: mp.redDePago,
            };
          }),
        };
      });
      const cajaDetallada = [...movimientos, ...ventasFormateadas];

      const cajaDetalladaSorted = cajaDetallada.sort(
        (a, b) =>
          new Date(b.fechaMovimiento).getTime() -
          new Date(a.fechaMovimiento).getTime(),
      );
      //EFECTIVO
      const cajaEfectivo = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'formaPago' in movimiento) {
            if (movimiento.formaPago === TipoMedioDePagoEnum.EFECTIVO) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesEfectivo = movimiento.detalle.filter(
              (detalle) => detalle.formaPago === TipoMedioDePagoEnum.EFECTIVO,
            );

            return detallesEfectivo;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //TRANSFERENCIA
      const cajaTransferencia = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'formaPago' in movimiento) {
            if (
              movimiento.formaPago ===
              TipoMedioDePagoEnum.TRANSFERENCIA_BANCARIA
            ) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesTransferencia = movimiento.detalle.filter(
              (detalle) =>
                detalle.formaPago ===
                TipoMedioDePagoEnum.TRANSFERENCIA_BANCARIA,
            );

            return detallesTransferencia;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //CHEQUE
      const cajaCheque = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'formaPago' in movimiento) {
            if (movimiento.formaPago === TipoMedioDePagoEnum.CHEQUE) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesCheque = movimiento.detalle.filter(
              (detalle) => detalle.formaPago === TipoMedioDePagoEnum.CHEQUE,
            );

            return detallesCheque;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //CUENTA CORRIENTE
      const cajaCuentaCorriente = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'formaPago' in movimiento) {
            if (movimiento.formaPago === TipoMedioDePagoEnum.CUENTA_CORRIENTE) {
              return [movimiento]; // Devolvemos array con un elemento
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesCuentaCorriente = movimiento.detalle.filter(
              (detalle) =>
                detalle.formaPago === TipoMedioDePagoEnum.CUENTA_CORRIENTE,
            );

            return detallesCuentaCorriente;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //OTRO
      const cajaOtro = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'formaPago' in movimiento) {
            if (movimiento.formaPago === TipoMedioDePagoEnum.OTRO) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesOtro = movimiento.detalle.filter(
              (detalle) => detalle.formaPago === TipoMedioDePagoEnum.OTRO,
            );

            return detallesOtro;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //VISA
      const cajaVisa = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'redDePago' in movimiento) {
            if (
              movimiento.redDePago === RedDePago.VISA &&
              (movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO)
            ) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesVisa = movimiento.detalle.filter(
              (detalle) =>
                detalle.redDePago === RedDePago.VISA &&
                (detalle.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                  detalle.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO),
            );

            return detallesVisa;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //MASTERCARD
      const cajaMastercard = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'redDePago' in movimiento) {
            if (
              movimiento.redDePago === RedDePago.MASTERCARD &&
              (movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO)
            ) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesMastercard = movimiento.detalle.filter(
              (detalle) =>
                detalle.redDePago === RedDePago.MASTERCARD &&
                (detalle.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                  detalle.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO),
            );

            return detallesMastercard;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //AMERICAN EXPRESS
      const cajaAmericanExpress = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'redDePago' in movimiento) {
            if (
              movimiento.redDePago === RedDePago.AMERICAN_EXPRESS &&
              (movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO)
            ) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesAmericanExpress = movimiento.detalle.filter(
              (detalle) =>
                detalle.redDePago === RedDePago.AMERICAN_EXPRESS &&
                (detalle.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                  detalle.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO),
            );

            return detallesAmericanExpress;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //NARANJA
      const cajaNaranja = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'redDePago' in movimiento) {
            if (
              movimiento.redDePago === RedDePago.NARANJA &&
              (movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                movimiento.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO)
            ) {
              return [movimiento];
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesNaranja = movimiento.detalle.filter(
              (detalle) =>
                detalle.redDePago === RedDePago.NARANJA &&
                (detalle.formaPago === TipoMedioDePagoEnum.TARJETA_CREDITO ||
                  detalle.formaPago === TipoMedioDePagoEnum.TARJETA_DEBITO),
            );

            return detallesNaranja;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //MERCADOPAGO
      const cajaMercadopago = cajaDetalladaSorted
        .flatMap((movimiento) => {
          if (typeof movimiento === 'object' && 'redDePago' in movimiento) {
            if (movimiento.redDePago === RedDePago.MERCADOPAGO) {
            }
          } else if (
            'detalle' in movimiento &&
            Array.isArray(movimiento.detalle)
          ) {
            const detallesMercadopago = movimiento.detalle.filter(
              (detalle) => detalle.redDePago === RedDePago.MERCADOPAGO,
            );

            return detallesMercadopago;
          }

          return [];
        })
        .reduce((acc, curr) => acc + curr.importe, 0);

      //TOTAL
      const total = cajaDetalladaSorted
        .map((movimiento) => {
          if (typeof movimiento === 'object' && 'importe' in movimiento) {
            return movimiento.importe;
          } else {
            return movimiento.detalle.reduce(
              (acc, curr) => acc + curr.importe,
              0,
            );
          }
        })
        .reduce((acc, curr) => acc + curr, 0);

      return {
        cajaDetallada,
        cajaEfectivo,
        cajaTransferencia,
        cajaCheque,
        cajaCuentaCorriente,
        cajaOtro,
        cajaVisa,
        cajaMastercard,
        cajaAmericanExpress,
        cajaNaranja,
        cajaMercadopago,
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
      throw new InternalServerErrorException(error.message);
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
      const cierre = await this.findCierreDelDia(null);

      if (!apertura) {
        throw new BadRequestException('No hubo apertura del día');
      }
      if (cierre) {
        throw new BadRequestException('Ya hubo un cierre del día');
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

        const cierre = await this.findCierreDelDia(null);

        if (cierre) {
          throw new BadRequestException('Ya hubo un cierre del día');
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

  @Cron('30 59 23 * * *')
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
