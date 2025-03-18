import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAudiometriaDTO } from './dto/create-audiometria.dto';
import { UpdateAudiometriaDTO } from './dto/update-audiometria.dto';
import { Audiometria } from './entities/audiometria.entity';
import { Cliente } from 'src/cliente/entities/cliente.entity';
import { ConfigService } from '@nestjs/config';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { format } from 'date-fns';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AudiometriaService {
  constructor(
    @InjectRepository(Audiometria)
    private audiometriaRepository: Repository<Audiometria>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<Audiometria[]> {
    try {
      return await this.audiometriaRepository.find({
        relations: { cliente: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las audiometrías: ' + error,
      );
    }
  }

  async findOne(id: number): Promise<Audiometria> {
    try {
      const audiometria = await this.audiometriaRepository.findOne({
        where: { id },
        relations: { cliente: true },
      });

      if (!audiometria) {
        throw new NotFoundException(`Audiometría con id ${id} no encontrada`);
      }

      return audiometria;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la audiometría: ' + error,
      );
    }
  }

  async create(
    dto: CreateAudiometriaDTO,
    pdf: Express.Multer.File,
  ): Promise<Audiometria> {
    try {
      const audiometriaDTO = plainToInstance(CreateAudiometriaDTO, dto);
      const errors = await validate(audiometriaDTO);

      if (errors.length > 0) {
        throw new BadRequestException('Datos de audiometría no válidos.');
      }

      const clienteExistente = await this.clienteRepository.findOne({
        where: { id: audiometriaDTO.cliente.id },
      });

      if (!clienteExistente) {
        throw new NotFoundException(
          `Cliente con id ${audiometriaDTO.cliente.id} no encontrado`,
        );
      }

      if (
        !pdf ||
        !pdf.originalname.toLowerCase().endsWith('.pdf') ||
        pdf.size === 0
      ) {
        throw new BadRequestException(
          'No se ha subido ningún archivo PDF o está vacío.',
        );
      }

      const uploadDir = join(process.cwd(), 'uploads', 'audiometrias');
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = Date.now().toString() + '.pdf';

      const filePath = join(uploadDir, fileName);
      await fs.writeFile(filePath, pdf.buffer);

      audiometriaDTO.linkPDF = fileName;

      const audiometria = this.audiometriaRepository.create(audiometriaDTO);
      return await this.audiometriaRepository.save(audiometria);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al crear la audiometría: ' + error,
      );
    }
  }

  async update(
    id: number,
    audiometriaDTO: UpdateAudiometriaDTO,
    pdf?: Express.Multer.File,
  ): Promise<Audiometria> {
    try {
      const audiometriaExistente = await this.audiometriaRepository.findOne({
        where: { id },
        relations: ['cliente'],
      });

      if (!audiometriaExistente) {
        throw new NotFoundException(`Audiometría con id ${id} no encontrada`);
      }

      if (pdf) {
        if (
          !pdf.originalname.toLowerCase().endsWith('.pdf') ||
          pdf.size === 0
        ) {
          throw new BadRequestException('El archivo debe ser un PDF válido');
        }

        if (audiometriaExistente.linkPDF) {
          try {
            await fs.unlink(audiometriaExistente.linkPDF);
          } catch (error) {
            throw new Error('Error eliminando PDF anterior: ' + error.message);
          }
        }

        const clienteId =
          audiometriaDTO.cliente?.id || audiometriaExistente.cliente.id;
        const fechaInforme =
          audiometriaDTO.fechaInforme || audiometriaExistente.fechaInforme;

        const uploadDir = join(process.cwd(), 'uploads', 'audiometrias');
        await fs.mkdir(uploadDir, { recursive: true });

        const formattedDate = format(fechaInforme, 'yyyyMMdd');
        const baseName = `audiometria-cliente-${clienteId}-${formattedDate}`;
        let newFileName = `${baseName}.pdf`;
        let counter = 1;

        while (await fileExists(join(uploadDir, newFileName))) {
          newFileName = `${baseName}-${counter}.pdf`;
          counter++;
        }

        const filePath = join(uploadDir, newFileName);
        await fs.writeFile(filePath, pdf.buffer);

        audiometriaDTO.linkPDF = filePath;
      }

      Object.assign(audiometriaExistente, audiometriaDTO);
      return await this.audiometriaRepository.save(audiometriaExistente);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error al actualizar audiometría: ${error.message}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const audiometria = await this.audiometriaRepository.findOne({
        where: { id },
      });

      if (!audiometria) {
        throw new NotFoundException(`Audiometría con id ${id} no encontrada`);
      }

      await this.audiometriaRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar la audiometría: ' + error,
      );
    }
  }

  async uploadPDF() {
    return null;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
