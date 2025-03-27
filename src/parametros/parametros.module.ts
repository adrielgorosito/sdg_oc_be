import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parametro } from './entities/parametro.entity';
import { ParametrosController } from './parametros.controller';
import { ParametrosService } from './parametros.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Parametro])],
  controllers: [ParametrosController],
  providers: [ParametrosService],
  exports: [ParametrosService],
})
export class ParametrosModule {}
