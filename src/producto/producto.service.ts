import {
  BadRequestException,
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
import { UpdatePrecioProductoDTO } from './dto/update-precio-producto.dto';
import { UpdateProductoDTO } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';
import { generarCodigoProv } from './utils/generador-codigo';

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
        filtro,
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
          'producto.categoria COLLATE Latin1_General_CI_AI LIKE :categoria',
          { categoria: `%${categoria.trim()}%` },
        );
      }
      if (descripcion) {
        queryBuilder.andWhere(
          'producto.descripcion COLLATE Latin1_General_CI_AI LIKE :descripcion',
          { descripcion: `%${descripcion.trim()}%` },
        );
      }
      if (nombreMarca) {
        queryBuilder.andWhere(
          'marca.nombre COLLATE Latin1_General_CI_AI LIKE :nombreMarca',
          { nombreMarca: `%${nombreMarca.trim()}%` },
        );
      }
      if (marcaId) {
        queryBuilder.andWhere('marca.id = :marcaId', { marcaId });
      }
      if (razonSocialProveedor) {
        queryBuilder.andWhere(
          'proveedor.razonSocial COLLATE Latin1_General_CI_AI LIKE :razonSocialProveedor',
          { razonSocialProveedor: `%${razonSocialProveedor.trim()}%` },
        );
      }
      if (proveedorId) {
        queryBuilder.andWhere('proveedor.id = :proveedorId', { proveedorId });
      }
      if (filtro) {
        queryBuilder.andWhere(
          'producto.descripcion COLLATE Latin1_General_CI_AI LIKE :filtro OR marca.nombre COLLATE Latin1_General_CI_AI LIKE :filtro OR proveedor.razonSocial COLLATE Latin1_General_CI_AI LIKE :filtro OR producto.categoria COLLATE Latin1_General_CI_AI LIKE :filtro OR producto.codProv COLLATE Latin1_General_CI_AI LIKE :filtro',
          { filtro: `%${filtro.trim()}%` },
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el producto: ' + error,
      );
    }
  }

  async create(productoDTO: CreateProductoDTO) {
    try {
      if (productoDTO.codProv) {
        const productoExistente = await this.productoRepository.findOne({
          where: {
            codProv: productoDTO.codProv,
          },
        });

        if (productoExistente) {
          throw new BadRequestException(
            `El producto con código de proveedor ${productoDTO.codProv} ya existe`,
          );
        }
      } else {
        productoDTO.codProv = generarCodigoProv();
      }

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
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar el producto: ' + error,
      );
    }
  }

  async updatePrecioMarcaProveedor(
    updatePrecioProductoDTO: UpdatePrecioProductoDTO,
  ): Promise<Producto[]> {
    const { marca, proveedor, porcentaje } = updatePrecioProductoDTO;

    try {
      const marcaExistente = await this.marcaRepository.findOne({
        where: { id: marca.id },
      });

      if (!marcaExistente) {
        throw new NotFoundException(`Marca con id ${marca.id} no encontrada`);
      }

      const proveedorExistente = await this.proveedorRepository.findOne({
        where: { id: proveedor.id },
      });

      if (!proveedorExistente) {
        throw new NotFoundException(
          `Proveedor con id ${proveedor.id} no encontrado`,
        );
      }

      const productos = await this.productoRepository.find({
        where: { marca: { id: marca.id }, proveedor: { id: proveedor.id } },
      });

      if (productos.length === 0) {
        throw new NotFoundException(
          `No se encontraron productos para la marca ${marcaExistente.nombre} y el proveedor ${proveedorExistente.razonSocial}`,
        );
      }

      productos.forEach((producto) => {
        producto.precio = producto.precio * (1 + porcentaje / 100);
        producto.precioLista = producto.precioLista * (1 + porcentaje / 100);
      });

      return await this.productoRepository.save(productos);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException(
        'Error al actualizar el precio de los productos: ' + error,
      );
    }
  }
}
