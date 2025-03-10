import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

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

export const configDataBase = {
  user: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  server: configService.get('DB_HOST'),
  port: parseInt(configService.get('DB_PORT')),
  database: configService.get('DB_NAME'),
  connectionTimeout: 10000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
