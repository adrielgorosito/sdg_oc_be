import { InjectRepository } from '@nestjs/typeorm
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { Marca } from 'src/marca/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { CreateProductoDTO } from './dto/create-producto.dto';
import { UpdateProductoDTO } from './dto/update-producto.dto copy';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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

  async findAll() {
    try {
      const productos = await this.productoRepository.find({
        relations: {
          marca: true,
          proveedor: true,
        },
        order: {
          descripcion: 'ASC',
        },
      });

      return productos;
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
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      
      return producto;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el producto: ' + error);
    }
  }

  async create(productoDTO: CreateProductoDTO) {
    try {
      const marcaExistente: Marca = await this.marcaRepository.findOne({
        where: { id: productoDTO.marca.id },
      });
      
      if (!marcaExistente) {
        throw new NotFoundException(
          `Marca con ID ${productoDTO.marca.id} no encontrada`,
        );
      }

      const proveedorExistente: Proveedor =
        await this.proveedorRepository.findOne({
          where: { id: productoDTO.proveedor.id },
        });
      
      if (!proveedorExistente) {
        throw new NotFoundException(
          `Proveedor con ID ${productoDTO.proveedor.id} no encontrado`,
        );
      }

      const nuevoProducto = this.productoRepository.create(productoDTO);
      return await this.productoRepository.save(nuevoProducto);
    } catch (error) {
      throw new InternalServerErrorException('Error al crear el producto: ' + error);
    }
  }

  async update(id: number, producto: UpdateProductoDTO): Promise<Producto> {
    try {
      const productoExistente = await this.productoRepository.findOne({
        where: { id },
      });

      if (!productoExistente) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      Object.assign(productoExistente, producto);
      return await this.productoRepository.save(productoExistente);
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el producto: ' + error);
    }
  }

  async remove(id: number) {
    try {
      const producto = await this.productoRepository.findOne({
        where: { id },
      });
      
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      
      await this.productoRepository.remove(producto);
    } catch (error) {
      throw new InternalServerErrorException('Error al eliminar el producto: ' + error);
    }
  }
}
