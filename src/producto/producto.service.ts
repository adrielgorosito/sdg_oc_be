import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Marca } from 'src/marca/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Repository } from 'typeorm';
import { CreateProductoDTO } from './dto/create-producto.dto';
import { PaginateProductoDTO } from './dto/paginate-producto.dto';
import { UpdateProductoDTO } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Marca)
    private marcaRepository: Repository<Marca>,
    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,
  ) {}

  async findAll(paginateProductoDTO: PaginateProductoDTO) {
    try {
      const {
        limit,
        offset,
        categoria,
        descripcion,
        nombreMarca,
        razonSocialProveedor,
        marcaId,
        proveedorId,
      } = paginateProductoDTO;

      const queryBuilder = this.productoRepository
        .createQueryBuilder('producto')
        .leftJoinAndSelect('producto.marca', 'marca')
        .leftJoinAndSelect('producto.proveedor', 'proveedor')
        .orderBy('producto.descripcion', 'ASC')
        .take(limit)
        .skip(offset);

      if (categoria) {
        queryBuilder.andWhere(
          'LOWER(producto.categoria) LIKE LOWER(:categoria)',
          { categoria: `%${categoria}%` },
        );
      }
      if (descripcion) {
        queryBuilder.andWhere(
          'LOWER(producto.descripcion) LIKE LOWER(:descripcion)',
          { descripcion: `%${descripcion}%` },
        );
      }
      if (nombreMarca) {
        queryBuilder.andWhere('LOWER(marca.nombre) LIKE LOWER(:nombreMarca)', {
          nombreMarca: `%${nombreMarca}%`,
        });
      }
      if (marcaId) {
        queryBuilder.andWhere('marca.id = :marcaId', { marcaId });
      }
      if (razonSocialProveedor) {
        queryBuilder.andWhere(
          'LOWER(proveedor.razonSocial) LIKE LOWER(:razonSocialProveedor)',
          { razonSocialProveedor: `%${razonSocialProveedor}%` },
        );
      }
      if (proveedorId) {
        queryBuilder.andWhere('proveedor.id = :proveedorId', { proveedorId });
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
        'Error al obtener los productos: ' + error,
      );
    }
  }

  async findOne(id: number) {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id },
        relations: {
          marca: true,
          proveedor: true,
        },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con id ${id} no encontrado`);
      }

      return producto;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener el producto: ' + error,
      );
    }
  }

  async create(productoDTO: CreateProductoDTO) {
    try {
      const marcaExistente: Marca = await this.marcaRepository.findOne({
        where: { id: productoDTO.marca.id },
      });

      if (!marcaExistente) {
        throw new NotFoundException(
          `Marca con id ${productoDTO.marca.id} no encontrada`,
        );
      }

      const proveedorExistente: Proveedor =
        await this.proveedorRepository.findOne({
          where: { id: productoDTO.proveedor.id },
        });

      if (!proveedorExistente) {
        throw new NotFoundException(
          `Proveedor con id ${productoDTO.proveedor.id} no encontrado`,
        );
      }

      const nuevoProducto = this.productoRepository.create(productoDTO);
      return await this.productoRepository.save(nuevoProducto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al crear el producto: ' + error,
      );
    }
  }

  async update(id: number, producto: UpdateProductoDTO): Promise<Producto> {
    try {
      const productoExistente = await this.productoRepository.findOne({
        where: { id },
      });

      if (!productoExistente) {
        throw new NotFoundException(`Producto con id ${id} no encontrado`);
      }

      Object.assign(productoExistente, producto);
      return await this.productoRepository.save(productoExistente);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar el producto: ' + error,
      );
    }
  }

  async remove(id: number) {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con id ${id} no encontrado`);
      }

      await this.productoRepository.remove(producto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar el producto: ' + error,
      );
    }
  }
}
