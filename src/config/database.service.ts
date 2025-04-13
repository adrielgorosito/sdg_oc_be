import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import * as fs from 'fs';
import * as sql from 'mssql';
import * as path from 'path';
import { configDataBase } from './typeorm.config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor() {}

  async onModuleInit() {
    //await this.ejecutarDump();
  }

  async ejecutarDump() {
    try {
      const pool = await sql.connect(configDataBase);
      const dumpPath = path.join(process.cwd(), 'database', 'seed.dump.sql');

      if (!fs.existsSync(dumpPath))
        throw new Error('No se encontró el archivo de seed');

      const script = fs.readFileSync(dumpPath, 'utf-8');
      await pool.request().query(script);
      await pool.close();
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudieron cargar los datos iniciales: ' + error,
      );
    }
  }
}
