import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();
const configService = new ConfigService();

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
