import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parse } from 'date-fns';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ComprobanteService } from 'src/comprobante/services/comprobante.service';
import { CuentaCorrienteService } from 'src/cuenta-corriente/cuenta-corriente.service';
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
  ) {}

  async create(createVentaDto: CreateVentaDTO): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      const venta = await this.processVentaTransaction(
        queryRunner,
        createVentaDto,
      );
      const factura = await this.processFacturaTransaction(venta);
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

      if (nombreCliente) {
        queryBuilder.andWhere(
          'CONCAT(LOWER(cliente.nombre), LOWER(cliente.apellido)) LIKE LOWER(:nombreCliente)',
          {
            nombreCliente: `%${nombreCliente.toLowerCase().replace(' ', '').trim()}%`,
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
      if (fechaDesde) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDesde)) {
          throw new BadRequestException(
            `Formato de fecha inválido. Se esperaba 'YYYY-MM-DD'`,
          );
        }

        const fecha = parse(fechaDesde, 'yyyy-MM-dd', new Date());
        queryBuilder.andWhere('venta.fecha  >= :fechaDesde ', {
          fechaDesde: fecha,
        });
      }
      if (fechaHasta) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaHasta)) {
          throw new BadRequestException(
            `Formato de fecha inválido. Se esperaba 'YYYY-MM-DD'`,
          );
        }

        const fecha = parse(fechaHasta, 'yyyy-MM-dd', new Date());
        queryBuilder.andWhere('venta.fecha  <= :fechaHasta ', {
          fechaHasta: fecha,
        });
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
    try {
      const factura = await this.comprobanteService.crearComprobante(
        null,
        venta,
      );
      return factura;
    } catch (error) {
      this.handleTransactionError(error);
    }
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
    createVentaDto.ventaObraSocial.forEach((vos) => {
      vos.obraSocial = obraSociales.find((os) => os.id === vos.obraSocial.id);
    });

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
}
