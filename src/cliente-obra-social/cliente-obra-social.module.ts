import { Module } from '@nestjs/common';
import { ClienteObraSocialService } from './cliente-obra-social.service';
import { ClienteObraSocialController } from './cliente-obra-social.controller';

@Module({
  controllers: [ClienteObraSocialController],
  providers: [ClienteObraSocialService],
})
export class ClienteObraSocialModule {}
