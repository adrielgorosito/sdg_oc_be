import { Module } from '@nestjs/common';
import { ObraSocialService } from './obra-social.service';
import { ObraSocialController } from './obra-social.controller';

@Module({
  controllers: [ObraSocialController],
  providers: [ObraSocialService],
})
export class ObraSocialModule {}
