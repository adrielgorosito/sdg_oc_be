import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ParametrosService } from './parametros.service';

@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Get()
  async getAllParams() {
    return this.parametrosService.getAllParams();
  }

  @Get(':key')
  async getParam(@Param('key') key: string) {
    return this.parametrosService.getParam(key);
  }

  @Post()
  async setParam(@Body() body: { key: string; value: string }) {
    return this.parametrosService.setParam(body.key, body.value);
  }
}
