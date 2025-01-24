import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ObraSocialService } from './obra-social.service';
import { CreateObraSocialDto } from './dto/obra-social.dto';
import { UpdateObraSocialDto } from './dto/update-obra-social.dto';

@Controller('obra-social')
export class ObraSocialController {
  constructor(private readonly obraSocialService: ObraSocialService) {}

  @Post()
  create(@Body() createObraSocialDto: CreateObraSocialDto) {
    return this.obraSocialService.create(createObraSocialDto);
  }

  @Get()
  findAll() {
    return this.obraSocialService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.obraSocialService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObraSocialDto: UpdateObraSocialDto) {
    return this.obraSocialService.update(+id, updateObraSocialDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.obraSocialService.remove(+id);
  }
}
