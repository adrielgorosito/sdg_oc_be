import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductoDTO } from './dto/create-producto.dto';
import { PaginateProductoDTO } from './dto/paginate-producto.dto';
import { UpdatePrecioProductoDTO } from './dto/update-precio-producto.dto';
import { UpdateProductoDTO } from './dto/update-producto.dto';
import { ProductoService } from './producto.service';
import { ExcelService } from './utils/excel.service';

@Controller('producto')
export class ProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly excelService: ExcelService,
  ) {}

  @Get()
  findAll(@Query() paginateProductoDTO: PaginateProductoDTO) {
    return this.productoService.findAll(paginateProductoDTO);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productoService.findOne(id);
  }

  @Post()
  create(@Body() productoDTO: CreateProductoDTO) {
    return this.productoService.create(productoDTO);
  }

  @Patch('precio')
  updatePrecio(@Body() updatePrecioProductoDTO: UpdatePrecioProductoDTO) {
    return this.productoService.updatePrecioMarcaProveedor(
      updatePrecioProductoDTO,
    );
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() productoDTO: UpdateProductoDTO) {
    return this.productoService.update(id, productoDTO);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.productoService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body('marcaId') marcaId: number,
    @Body('proveedorId') proveedorId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.excelService.processExcel(proveedorId, marcaId, file);
  }
}
