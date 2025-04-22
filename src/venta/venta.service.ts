import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CajaService } from 'src/caja/caja.service';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ComprobanteService } from 'src/comprobante/services/comprobante.service';
import { CuentaCorrienteService } from 'src/cuenta-corriente/cuenta-corriente.service';
import { CreateMedioDePagoDto } from 'src/medio-de-pago/dto/create-medio-de-pago.dto';
import { TipoMedioDePagoEnum } from 'src/medio-de-pago/enum/medio-de-pago.enum';
import { TipoMovimiento } from 'src/movimiento/enums/tipo-movimiento.enum';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { CreateVentaDTO } from './dto/create-venta.dto';
import { PaginateVentaDTO } from './dto/paginate-venta.dto';
import { UpdateVentaDTO } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
@Injectable()
export class VentaService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    private readonly comprobanteService: ComprobanteService,
    private readonly cuentaCorrienteService: CuentaCorrienteService,
    private readonly cajaService: CajaService,
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      if (!(await this.cajaService.findAperturaDelDia(null))) {
        throw new BadRequestException(
          'No se puede crear una venta ya que no se hizo la apertura del día',
        );
      }
      if (await this.cajaService.findCierreDelDia(null)) {
        throw new BadRequestException(
          'No se puede crear una venta ya que se hizo el cierre del día',
        );
      }

      const venta = await this.processVentaTransaction(
        queryRunner,
        createVentaDto,
      );

      let factura;
      try {
        factura = await this.processFacturaTransaction(venta);
      } catch (error) {
        factura = {
          error: error.message,
        };
      }

      delete factura.venta;
      delete factura.facturaRelacionada;

      return {
        venta,
        factura,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginateVentaDTO: PaginateVentaDTO) {
    try {
      const {
        limit,
        offset,
        fechaDesde,
        fechaHasta,
        clienteId,
        nombreCliente,
        nroDocumento: nroDocumentoCliente,
        tipoComprobante,
        pendientes,
      } = paginateVentaDTO;

      const queryBuilder = this.ventaRepository
        .createQueryBuilder('venta')
        .leftJoinAndSelect('venta.cliente', 'cliente')
        .leftJoinAndSelect('venta.lineasDeVenta', 'lineasDeVenta')
        .leftJoinAndSelect('venta.mediosDePago', 'mediosDePago')
        .leftJoinAndSelect('venta.ventaObraSocial', 'ventaObraSocial')
        .leftJoinAndSelect('ventaObraSocial.obraSocial', 'obraSocial')
        .leftJoinAndSelect('venta.factura', 'factura')
        .orderBy('venta.fecha', 'DESC')
        .take(limit)
        .skip(offset);

      if (pendientes === 1) {
        queryBuilder.andWhere('factura.id IS NULL');
      }

      if (nombreCliente) {
        queryBuilder.andWhere(
          'CONCAT(cliente.nombre, cliente.apellido) COLLATE Latin1_General_CI_AI LIKE :nombreCliente',
          {
            nombreCliente: `%${nombreCliente.replace(' ', '').trim()}%`,
          },
        );
      }

      if (nroDocumentoCliente) {
        queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
          nroDocumento: `%${nroDocumentoCliente}%`,
        });
      }

      if (clienteId) {
        queryBuilder.andWhere('cliente.id =  :clienteId', {
          clienteId,
        });
      }

      const whereParams: Record<string, any> = {};
      if (fechaDesde) {
        const fechaDesdeDate = new Date(fechaDesde + 'T00:00:00-03:00');
        whereParams.fechaDesde = fechaDesdeDate;
      }
      if (fechaHasta) {
        const fechaHastaDate = new Date(fechaHasta + 'T23:59:59-03:00');
        whereParams.fechaHasta = fechaHastaDate;
      }
      console.log(whereParams);

      if (fechaDesde && fechaHasta) {
        queryBuilder.andWhere(
          'venta.fecha BETWEEN :fechaDesde AND :fechaHasta',
          whereParams,
        );
      } else if (fechaDesde) {
        queryBuilder.andWhere('venta.fecha >= :fechaDesde', whereParams);
      } else if (fechaHasta) {
        queryBuilder.andWhere('venta.fecha <= :fechaHasta', whereParams);
      }

      if (tipoComprobante) {
        queryBuilder.andWhere('factura.tipoComprobante = :tipoComprobante', {
          tipoComprobante,
        });
      }

      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        items,
        total,
        limit,
        offset,
        nextPage: total > offset + limit ? offset + limit : null,
        previousPage: offset > 0 ? offset - limit : null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener las ventas: ' + error.message,
      );
    }
  }

  async findOne(id: string) {
    try {
      const venta = await this.ventaRepository.findOne({
        where: { id },
        relations: {
          cliente: true,
          factura: true,
          ventaObraSocial: {
            obraSocial: true,
          },
          lineasDeVenta: {
            producto: true,
          },
          mediosDePago: true,
        },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }

      const comprobantesRelacionados =
        await this.comprobanteService.findComprobantesRelacionadosByVenta(
          null,
          venta,
        );

      return { venta, comprobantesRelacionados: comprobantesRelacionados };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la venta: ' + error,
      );
    }
  }

  async update(id: string, updateVentaDto: UpdateVentaDTO): Promise<Venta> {
    try {
      const ventaExistente = await this.ventaRepository.findOne({
        where: { id },
      });

      if (!ventaExistente) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }

      Object.assign(ventaExistente, updateVentaDto);
      return await this.ventaRepository.save(ventaExistente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al actualizar la venta: ' + error,
      );
    }
  }

  async remove(id: string) {
    try {
      const venta = await this.ventaRepository.findOne({
        where: { id },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con id ${id} no encontrada`);
      }

      await this.ventaRepository.remove(venta);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar la venta: ' + error,
      );
    }
  }

  private async processVentaTransaction(
    queryRunner: QueryRunner,
    createVentaDto: CreateVentaDTO,
  ) {
    await queryRunner.startTransaction();

    try {
      const cliente = await this.validateAndGetCliente(
        queryRunner,
        createVentaDto.cliente.id,
      );
      const obraSociales = await this.validateAndGetObrasSociales(
        queryRunner,
        createVentaDto,
      );

      const nuevaVenta = this.prepareVenta(createVentaDto, obraSociales);

      await this.validateImportes(nuevaVenta, nuevaVenta.mediosDePago);

      nuevaVenta.importe = this.calcularImporte(nuevaVenta);
      await this.handleCuentaCorriente(queryRunner, nuevaVenta, cliente);

      const venta = await queryRunner.manager.save(Venta, nuevaVenta);
      await queryRunner.commitTransaction();

      venta.cliente = cliente;
      return venta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleTransactionError(error);
    }
  }

  private async processFacturaTransaction(venta: Venta) {
    const factura = await this.comprobanteService.crearComprobante(null, venta);
    return factura;
  }

  private calcularImporte(venta: Venta) {
    const importeLineasDeVenta = venta.lineasDeVenta.reduce(
      (acc, curr) => acc + curr.precioIndividual * curr.cantidad,
      0,
    );
    return importeLineasDeVenta;
  }

  private async validateAndGetCliente(
    queryRunner: QueryRunner,
    clienteId: number,
  ): Promise<Cliente> {
    const cliente = await queryRunner.manager.findOne(Cliente, {
      where: { id: clienteId },
      relations: { cuentaCorriente: true },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  private async validateAndGetObrasSociales(
    queryRunner: QueryRunner,
    createVentaDto: CreateVentaDTO,
  ) {
    if (!createVentaDto.ventaObraSocial) {
      return [];
    }

    const obraSocialesIds = createVentaDto.ventaObraSocial.map(
      (vos) => vos.obraSocial.id,
    );
    const obraSociales = await queryRunner.manager.find(ObraSocial, {
      where: { id: In(obraSocialesIds) },
    });

    if (obraSociales.length !== obraSocialesIds.length) {
      throw new NotFoundException('Alguna obra social no encontrada');
    }

    return obraSociales;
  }

  private prepareVenta(
    createVentaDto: CreateVentaDTO,
    obraSociales: ObraSocial[],
  ): Venta {
    if (createVentaDto.ventaObraSocial) {
      createVentaDto.ventaObraSocial.forEach((vos) => {
        vos.obraSocial = obraSociales.find((os) => os.id === vos.obraSocial.id);
      });
    }

    return this.dataSource.manager.create(Venta, createVentaDto);
  }

  private async handleCuentaCorriente(
    queryRunner: QueryRunner,
    venta: Venta,
    cliente: Cliente,
  ) {
    const medioDePagoCC = venta.mediosDePago.find(
      (medio) => medio.tipoMedioDePago === TipoMedioDePagoEnum.CUENTA_CORRIENTE,
    );

    if (medioDePagoCC) {
      if (!cliente.cuentaCorriente) {
        throw new NotFoundException('Cliente no posee cuenta corriente');
      }

      cliente.cuentaCorriente =
        await this.cuentaCorrienteService.afectarCuentaCorriente(
          cliente.id,
          {
            importe: medioDePagoCC.importe,
            tipoMovimiento: TipoMovimiento.VENTA,
          },
          queryRunner.manager,
        );
    }
  }

  private handleTransactionError(error: any) {
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }
    throw error;
  }

  private async validateImportes(
    venta: Venta,
    mediosDePago: CreateMedioDePagoDto[],
  ) {
    const importeDescuentoObraSocial =
      venta.ventaObraSocial?.reduce((total, vos) => total + vos.importe, 0) ||
      0;

    const importeVentaSegunLineasDeVenta = venta.lineasDeVenta.reduce(
      (total, linea) => total + linea.precioIndividual * linea.cantidad,
      0,
    );

    const descuentoEmpresa =
      (importeVentaSegunLineasDeVenta - importeDescuentoObraSocial) *
      (venta.descuentoPorcentaje / 100);

    const importeAFacturar =
      importeVentaSegunLineasDeVenta -
      importeDescuentoObraSocial -
      descuentoEmpresa;

    const importeMediosDePago = mediosDePago.reduce(
      (total, medio) => total + medio.importe,
      0,
    );

    if (importeMediosDePago !== importeAFacturar) {
      throw new BadRequestException(
        'El importe de los medios de pago no es igual al importe a facturar',
      );
    }
  }
}
