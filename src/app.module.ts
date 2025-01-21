import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      username: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: +DB_PORT,
      database: DB_NAME,
      entities: [__dirname + '///*.entity{.ts,.js}'],
      synchronize: true,
    })]
})
export class AppModule {}
