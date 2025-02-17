import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RolesGuard } from './roles.guard';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class UserModule {}
