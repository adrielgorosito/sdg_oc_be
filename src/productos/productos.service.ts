import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Producto } from './entities/producto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from 'src/marcas/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { ProductoDTO } from './dto/producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Marca)
    private marcaRepository: Repository<Marca>,
    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,
  ) {}
  async create(productoDTO: ProductoDTO) {
    const marcaExistente: Marca = await this.marcaRepository.findOne({
      where: { id: productoDTO.marca.id },
    });
    if (!marcaExistente) {
      throw new HttpException('La marca no existe', HttpStatus.NOT_FOUND);
    }

    const proveedorExistente: Proveedor =
      await this.proveedorRepository.findOne({
        where: { id: productoDTO.proveedor.id },
      });
    if (!proveedorExistente) {
      throw new HttpException('El proveedor no existe', HttpStatus.NOT_FOUND);
    }

    const nuevoProducto = this.productoRepository.create(productoDTO);
    await this.productoRepository.save(nuevoProducto);

    return nuevoProducto;
  }

  async findAll() {
    return await this.productoRepository.find();
  }

  async findOne(id: number) {
    return `This action returns a #${id} producto`;
  }

  remove(id: number) {
    return `This action removes a #${id} producto`;
  }
}
