import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteObraSocial } from './entities/cliente-obra-social.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';
import { CreateClienteObraSocialDTO } from './dto/create-cliente-obra-social.dto';
import { UpdateClienteObraSocialDTO } from './dto/update-cliente-obra-social.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ClienteObraSocialService {
  constructor(
    @InjectRepository(ClienteObraSocial)
    private cliObSocRepository: Repository<ClienteObraSocial>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(ObraSocial)
    private obraSocialRepository: Repository<ObraSocial>,
  ) {}

  async findAll(
    idCliente?: number,
    idObraSocial?: number,
  ): Promise<ClienteObraSocial[]> {
    try {
      const queryBuilder =
        this.cliObSocRepository.createQueryBuilder('cliObSoc');

      if (idCliente) {
        queryBuilder.andWhere('cliObSoc.clienteId = :idCliente', { idCliente });
      }

      if (idObraSocial) {
        queryBuilder.andWhere('cliObSoc.obraSocialId = :idObraSocial', {
          idObraSocial,
        });
      }

      queryBuilder.leftJoinAndSelect('cliObSoc.cliente', 'cliente');
      queryBuilder.leftJoinAndSelect('cliObSoc.obraSocial', 'obraSocial');

      return await queryBuilder.getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las relaciones cliente-obra social: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<ClienteObraSocial> {
    try {
      const cliObSoc = await this.cliObSocRepository.findOne({
        where: { id },
        relations: {
          cliente: true,
          obraSocial: true,
        },
      });

      if (!cliObSoc) {
        throw new NotFoundException(
          `Relación cliente-obra social con id ${id} no encontrada`,
        );
      }

      return cliObSoc;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener la relación cliente-obra social: ' + error,
      );
    }
  }

  async create(
    cliObSocDTO: CreateClienteObraSocialDTO,
  ): Promise<ClienteObraSocial> {
    try {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: cliObSocDTO.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(
          `Cliente con id ${cliObSocDTO.cliente.id} no encontrado`,
        );
      }

      const obraSocialExistente = await this.obraSocialRepository.findOne({
        where: { id: cliObSocDTO.obraSocial.id },
      });

      if (!obraSocialExistente) {
        throw new NotFoundException(
          `Obra social con id ${cliObSocDTO.obraSocial.id} no encontrada`,
        );
      }

      const clienteObraSocialExistente: ClienteObraSocial[] =
        await this.findAll(cliObSocDTO.cliente.id, cliObSocDTO.obraSocial.id);

      if (clienteObraSocialExistente.length > 0) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Ya existe una relación con idCliente ${cliObSocDTO.cliente.id} e idObraSocial ${cliObSocDTO.obraSocial.id}`,
            nroSocio: clienteObraSocialExistente[0].nroSocio,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const cliObSoc = this.cliObSocRepository.create(cliObSocDTO);
      return await this.cliObSocRepository.save(cliObSoc);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al crear la relación cliente-obra social: ' + error,
      );
    }
  }

  async update(
    id: number,
    cliObSocDTO: UpdateClienteObraSocialDTO,
  ): Promise<ClienteObraSocial> {
    try {
      const clienteObraSocial = await this.cliObSocRepository.findOne({
        where: { id },
      });

      if (!clienteObraSocial) {
        throw new NotFoundException(
          `Relación cliente-obra social con id ${id} no encontrada`,
        );
      }

      const cliObSocActualizado = Object.assign(clienteObraSocial, cliObSocDTO);
      return await this.cliObSocRepository.save(cliObSocActualizado);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la relación cliente-obra social: ' + error,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const clienteObraSocial = await this.cliObSocRepository.findOne({
        where: { id },
      });

      if (!clienteObraSocial) {
        throw new NotFoundException(
          `Cliente-obra social con id ${id} no encontrada`,
        );
      }

      await this.cliObSocRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar la relación cliente-obra social ' + error,
      );
    }
  }
}
