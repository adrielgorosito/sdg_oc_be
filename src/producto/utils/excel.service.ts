import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Producto } from '../entities/producto.entity';
import { Proveedor } from 'src/proveedor/entities/proveedor.entity';
import { Marca } from 'src/marca/entities/marca.entity';
import * as ExcelJS from 'exceljs';
import { CategoriaEnum } from '../enums/categoria.enum';

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

      const productos: Producto[] = this.getTemplate(workbook).map(
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

  private getTemplate(workbook: ExcelJS.Workbook): any[] {
    const productos: Partial<Producto>[] = [];
    const worksheet = workbook.getWorksheet('Productos');

    console.log(worksheet.rowCount);

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const codProv = this.getPlainText(
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
      const precioSugeridoVenta = Math.round(
        Number(this.getPlainText(worksheet.getRow(rowNumber).getCell(5).value)),
      );

      if (
        !codProv ||
        !descripcion ||
        !categoria ||
        !precioLista ||
        !precioSugeridoVenta
      ) {
        throw new BadRequestException(
          'El archivo contiene productos con valores nulos en campos obligatorios',
        );
      }

      const categoriaKey = Object.keys(CategoriaEnum).find(
        (k) =>
          CategoriaEnum[k as keyof typeof CategoriaEnum] ===
          categoria.replace(/ /g, '_'),
      );

      console.log(categoriaKey);

      productos.push({
        codProv,
        descripcion,
        categoria: CategoriaEnum[categoriaKey],
        precio: Math.round(Number(precioLista)),
        precioSugerido: Math.round(Number(precioSugeridoVenta)),
      });
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
