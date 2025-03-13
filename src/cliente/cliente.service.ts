import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaCorriente } from 'src/cuenta-corriente/entities/cuenta-corriente.entity';
import { RecetaLentesAereos } from 'src/receta-lentes-aereos/entities/receta-lentes-aereos.entity';
import { RecetaLentesContacto } from 'src/receta-lentes-contacto/entities/receta-lentes-contacto.entity';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDTO } from './dto/create-cliente.dto';
import { PaginateClienteDTO } from './dto/paginate-cliente.dto';
import { UpdateClienteDTO } from './dto/update-cliente.dto';
import { TipoDocumento } from './enums/tipo-documento.enum';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async findAll(paginateClienteDTO: PaginateClienteDTO) {
    try {
      const {
        limit,
        offset,
        nombre,
        filtro,
        nroDocumento,
        localidadId,
        provinciaId,
        nombreLocalidad,
        nombreProvincia,
      } = paginateClienteDTO;

      const queryBuilder = this.clienteRepository
        .createQueryBuilder('cliente')
        .leftJoinAndSelect('cliente.localidad', 'localidad')
        .leftJoinAndSelect('localidad.provincia', 'provincia')
        .orderBy('cliente.apellido', 'ASC')
        .addOrderBy('cliente.nombre', 'ASC')
        .take(limit)
        .skip(offset);

      if (filtro) {
        queryBuilder.andWhere(
          'CONCAT(LOWER(cliente.nombre), LOWER(cliente.apellido)) LIKE LOWER(:nombre) OR cliente.nroDocumento LIKE :nroDocumento',
          {
            nombre: `%${filtro.toLowerCase().replace(' ', '').trim()}%`,
            nroDocumento: `%${filtro}%`,
          },
        );
      }
      if (nombre) {
        queryBuilder.andWhere(
          'CONCAT(LOWER(cliente.nombre), LOWER(cliente.apellido)) LIKE LOWER(:nombre)',
          {
            nombre: `%${filtro.toLowerCase().replace(' ', '').trim()}%`,
          },
        );
      }
      if (nroDocumento) {
        queryBuilder.andWhere('cliente.nroDocumento LIKE :nroDocumento', {
          nroDocumento: `%${nroDocumento}%`,
        });
      }
      if (localidadId) {
        queryBuilder.andWhere('localidad.id = :localidadId', { localidadId });
      }
      if (provinciaId) {
        queryBuilder.andWhere('provincia.id = :provinciaId', { provinciaId });
      }

      if (nombreLocalidad) {
        queryBuilder.andWhere(
          'LOWER(localidad.nombre) LIKE LOWER(:nombreLocalidad)',
          {
            nombreLocalidad: `%${nombreLocalidad.toLowerCase().trim()}%`,
          },
        );
      }

      if (nombreProvincia) {
        queryBuilder.andWhere(
          'LOWER(localidad.nombre) LIKE LOWER(:nombreProvincia)',
          {
            nombreProvincia: `%${nombreProvincia.toLowerCase().trim()}%`,
          },
        );
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
      throw new InternalServerErrorException(
        'Error al obtener los clientes: ' + error,
      );
    }
  }

  async findOne(id: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id: id },
        relations: {
          localidad: true,
          clienteObrasSociales: { obraSocial: true },
          cuentaCorriente: true,
          historiaClinicaLentesContacto: true,
          ventas: true,
          audiometrias: true,
          recetasLentesAereos: true,
          recetasLentesContacto: true,
        },
      });

      if (!cliente) {
        throw new NotFoundException(`Cliente con id ${id} no encontrado`);
      }

      return cliente;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el cliente' + error,
      );
    }
  }

  async findByNroDocumento(nroDocumento: number, tipoDocumento: TipoDocumento) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { nroDocumento: nroDocumento, tipoDocumento: tipoDocumento },
        relations: {
          localidad: true,
          clienteObrasSociales: { obraSocial: true },
          cuentaCorriente: true,
          historiaClinicaLentesContacto: true,
          ventas: true,
          audiometrias: true,
          recetasLentesAereos: true,
          recetasLentesContacto: true,
        },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con nroDocumento ${nroDocumento} y tipoDocumento ${tipoDocumento} no encontrado`,
        );
      }

      return cliente;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el cliente' + error,
      );
    }
  }

  async create(createClienteDto: CreateClienteDTO) {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: {
          nroDocumento: createClienteDto.nroDocumento,
        },
      });

      if (clienteExistente) {
        throw new BadRequestException(
          'Ya existe un cliente con ese Numero de Documento',
        );
      }

      const cliente = this.clienteRepository.create(createClienteDto);
      cliente.cuentaCorriente = new CuentaCorriente();
      return await this.clienteRepository.save(cliente);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al crear el cliente' + error,
      );
    }
  }

  async update(id: number, updateClienteDto: UpdateClienteDTO) {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(`Cliente con id ${id} no encontrado`);
      }
      Object.assign(clienteExistente, updateClienteDto);

      return await this.clienteRepository.save(clienteExistente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async remove(id: number) {
    try {
      const cliente = await this.findOne(id);

      if (!cliente) {
        throw new NotFoundException(`Cliente con id ${id} no encontrado`);
      }
      return await this.clienteRepository.remove(cliente);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  async getCantidadRecetas() {
    try {
      const query = this.clienteRepository
        .createQueryBuilder('c')
        .select('c.id', 'clienteId')
        .addSelect('c.nombre', 'nombre')
        .addSelect('c.apellido', 'apellido')
        .addSelect((qb) => {
          return qb
            .select('COUNT(DISTINCT rla.id)', 'cantidadRecetasLentesAereos')
            .from(RecetaLentesAereos, 'rla')
            .where('rla.clienteId = c.id');
        }, 'cantidadRecetasLentesAereos')
        .addSelect((qb) => {
          return qb
            .select('COUNT(DISTINCT rlc.id)', 'cantidadRecetasLentesContacto')
            .from(RecetaLentesContacto, 'rlc')
            .where('rlc.clienteId = c.id');
        }, 'cantidadRecetasLentesContacto')
        .addSelect(
          `(SELECT GREATEST(
              (SELECT MAX(rla.fecha) FROM receta_lentes_aereos rla WHERE rla.clienteId = c.id),
              (SELECT MAX(rlc.fecha) FROM receta_lentes_contacto rlc WHERE rlc.clienteId = c.id)
          ))`,
          'fechaUltimaReceta',
        )
        .groupBy('c.id')
        .addGroupBy('c.nombre')
        .addGroupBy('c.apellido')
        .orderBy('c.id', 'ASC');

      const result = await query.getRawMany();
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los datos de las recetas por cliente: ' + error,
      );
    }
  }

  async getRecetasPorCliente(id: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id: id },
        relations: {
          recetasLentesAereos: {
            detallesRecetaLentesAereos: true,
          },
          recetasLentesContacto: {
            pruebasLentesContacto: true,
          },
          historiaClinicaLentesContacto: true,
        },
      });

      if (!cliente) {
        throw new NotFoundException(`Cliente con id ${id} no encontrado`);
      }

      return cliente;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el cliente' + error,
      );
    }
  }

  async getUltimaFechaAudiometrias() {
    try {
      const query = this.clienteRepository
        .createQueryBuilder('c')
        .select('c.id', 'clienteId')
        .addSelect('c.nombre', 'nombre')
        .addSelect('c.apellido', 'apellido')
        .addSelect(
          `(SELECT MAX(aud.fechaInforme) FROM audiometria aud WHERE aud.clienteId = c.id)`,
          'fechaUltimaAudiometria',
        )
        .groupBy('c.id')
        .addGroupBy('c.nombre')
        .addGroupBy('c.apellido')
        .orderBy('c.id', 'ASC');

      const result = await query.getRawMany();
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener los datos de las audiometrias por cliente: ' + error,
      );
    }
  }

  async getAudiometriasPorCliente(id: number) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id: id },
        relations: {
          audiometrias: true,
        },
      });

      if (!cliente) {
        throw new NotFoundException(`Cliente con id ${id} no encontrado`);
      }

      return cliente;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el cliente' + error,
      );
    }
  }
}
