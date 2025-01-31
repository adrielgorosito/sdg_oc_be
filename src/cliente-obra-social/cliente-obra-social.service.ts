import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClienteObraSocial } from './entities/cliente-obra-social.entity';
import { Repository } from 'typeorm';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ObraSocial } from 'src/obra-social/entities/obra-social.entity';
import { ClienteObraSocialDTO } from './dto/cliente-obra-social.dto';

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
    const queryBuilder = this.cliObSocRepository.createQueryBuilder('cliObSoc');

    if (idCliente) {
      queryBuilder.andWhere('cliObSoc.clienteId = :idCliente', { idCliente });
    }

    if (idObraSocial) {
      queryBuilder.andWhere('cliObSoc.obraSocialId = :idObraSocial', {
        idObraSocial,
      });
    }

    return await queryBuilder.getMany();
  }

  async findOneById(id: number): Promise<ClienteObraSocial> {
    return await this.cliObSocRepository.findOne({
      where: { id: id },
    });
  }

  async create(cliObSocDTO: ClienteObraSocialDTO): Promise<ClienteObraSocial> {
    const clienteExistente = await this.clienteRepository.findOne({
      where: { id: cliObSocDTO.cliente.id },
    });

    if (!clienteExistente) {
      throw new NotFoundException(
        `Cliente con id ${cliObSocDTO.cliente.id} no encontrado`,
      );
    }

    const obraSocialExists = await this.obraSocialRepository.findOne({
      where: { id: cliObSocDTO.obraSocial.id },
    });

    if (!obraSocialExists) {
      throw new NotFoundException(
        `Obra social con id ${cliObSocDTO.obraSocial.id} no encontrada`,
      );
    }

    const clienteObraSocialExists: ClienteObraSocial[] = await this.findAll(
      cliObSocDTO.cliente.id,
      cliObSocDTO.obraSocial.id,
    );

    if (clienteObraSocialExists.length > 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Ya existe una relación con idCliente ${cliObSocDTO.cliente.id} e idObraSocial ${cliObSocDTO.obraSocial.id}`,
          nroSocio: clienteObraSocialExists[0].nroSocio, // Incluyes nroSocio en la respuesta
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const cliObSoc = this.cliObSocRepository.create(cliObSocDTO);
    return await this.cliObSocRepository.save(cliObSoc);
  }

  async update(id: number, updateNroSocio: number): Promise<ClienteObraSocial> {
    const clienteObraSocial = await this.findOneById(id);

    if (!clienteObraSocial) {
      throw new NotFoundException(
        `Cliente-obra social con id ${id} no encontrada`,
      );
    }

    clienteObraSocial.nroSocio = updateNroSocio;

    return await this.cliObSocRepository.save(clienteObraSocial);
  }

  async delete(id: number): Promise<void> {
    const clienteObraSocial = await this.findOneById(id);

    if (!clienteObraSocial) {
      throw new NotFoundException(
        `Cliente-obra social con id ${id} no encontrada`,
      );
    }

    await this.cliObSocRepository.delete(id);
  }
}
