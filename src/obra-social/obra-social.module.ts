import { Module } from '@nestjs/common';
import { ObraSocialService } from './obra-social.service';
import { ObraSocialController } from './obra-social.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObraSocial } from './entities/obra-social.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObraSocial])],
  controllers: [ObraSocialController],
  providers: [ObraSocialService],
})
export class ObraSocialModule {}
