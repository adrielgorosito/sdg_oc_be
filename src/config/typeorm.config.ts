import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'mssql',
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT')),
  database: configService.get<string>('DB_NAME'),
  entities: ['**/*.entity{.ts,.js}'],
  migrations: ['src/database/**/*-migration.ts'],
  extra: {
    trustServerCertificate: true,
    encrypt: false,
    instanceName: 'SQLEXPRESS',
  },
  migrationsRun: false,
  logging: true,
  synchronize: false,
});
