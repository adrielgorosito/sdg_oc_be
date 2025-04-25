import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { Marca } from 'src/marca/entities/marca.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { CategoriaEnum } from '../enums/categoria.enum';
import { generarCodigoProv } from './generador-codigo';

@Injectable()
export class ExcelService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Marca)
    private marcaRepository: Repository<Marca>,
    @InjectRepository(Proveedor)
    private proveedorRepository: Repository<Proveedor>,
  ) {}

  async processExcel(
    proveedorId: number,
    marcaId: number,
    file: Express.Multer.File,
  ) {
    try {
      const proveedorExistente = await this.proveedorRepository.findOne({
        where: { id: proveedorId },
      });

      if (!proveedorExistente) {
        throw new NotFoundException(
          `Proveedor con id ${proveedorId} no encontrado`,
        );
      }

      const marcaExistente = await this.marcaRepository.findOne({
        where: { id: marcaId },
      });

      if (!marcaExistente) {
        throw new NotFoundException(`Marca con id ${marcaId} no encontrada`);
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer);

      const productos: Producto[] = (await this.getTemplate(workbook)).map(
        (producto) => ({
          ...producto,
          proveedor: proveedorExistente,
          marca: marcaExistente,
          updatedAt: null,
        }),
      );

      return await this.productoRepository.save(productos);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar el archivo: ' + error,
      );
    }
  }

  private async getTemplate(workbook: ExcelJS.Workbook): Promise<any[]> {
    const productos: Partial<Producto>[] = [];
    const worksheet = workbook.getWorksheet('Productos');
    const codProvExistentes = [];

    const productosExistentes = (
      await this.productoRepository.find({
        select: {
          codProv: true,
        },
      })
    ).map((producto) => producto.codProv);

    let totalRows = worksheet.rowCount;

    for (totalRows; 1; totalRows--) {
      if (
        worksheet.getRow(totalRows).getCell(1).value === null &&
        worksheet.getRow(totalRows).getCell(2).value === null &&
        worksheet.getRow(totalRows).getCell(3).value === null &&
        worksheet.getRow(totalRows).getCell(4).value === null &&
        worksheet.getRow(totalRows).getCell(5).value === null
      ) {
        totalRows = totalRows--;
      } else {
        break;
      }
    }

    for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
      let codProv = this.getPlainText(
        worksheet.getRow(rowNumber).getCell(1).value,
      );
      const descripcion = this.getPlainText(
        worksheet.getRow(rowNumber).getCell(2).value,
      );
      const categoria = this.getPlainText(
        worksheet.getRow(rowNumber).getCell(3).value,
      );
      const precioLista = Math.round(
        Number(this.getPlainText(worksheet.getRow(rowNumber).getCell(4).value)),
      );
      const precio = Math.round(
        Number(this.getPlainText(worksheet.getRow(rowNumber).getCell(5).value)),
      );

      if (!descripcion || !categoria || !precioLista || !precio) {
        throw new BadRequestException(
          'El archivo contiene productos con valores nulos en campos obligatorios',
        );
      }

      if (codProv) {
        if (productosExistentes.includes(codProv)) {
          codProvExistentes.push(codProv);
        }
      } else {
        codProv = generarCodigoProv();
      }

      const categoriaKey = Object.keys(CategoriaEnum).find(
        (k) =>
          CategoriaEnum[k as keyof typeof CategoriaEnum] ===
          categoria.replace(/ /g, '_'),
      );

      productos.push({
        codProv,
        descripcion,
        categoria: CategoriaEnum[categoriaKey],
        precioLista: Math.round(Number(precioLista)),
        precio: Math.round(Number(precio)),
      });
    }

    if (codProvExistentes.length > 0) {
      if (codProvExistentes.length === 1) {
        throw new BadRequestException(
          `El código de proveedor ${codProvExistentes[0]} ya existe`,
        );
      } else {
        throw new BadRequestException(
          `Los siguientes códigos de proveedor ya existen: ${codProvExistentes.join(', ')}`,
        );
      }
    }

    return productos;
  }

  private getPlainText(cellValue: any): string {
    if (cellValue && typeof cellValue === 'object' && 'richText' in cellValue) {
      return cellValue.richText.map((r: any) => r.text).join('');
    }
    return cellValue ?? '';
  }
}
