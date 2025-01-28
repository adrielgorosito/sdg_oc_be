import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';
import { MarcasModule } from './marcas/marcas.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ClienteModule } from './cliente/cliente.module';
import { ObraSocialModule } from './obra-social/obra-social.module';
import { ClienteObraSocialModule } from './cliente-obra-social/cliente-obra-social.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mssql',
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT')),
        database: configService.get('DB_NAME'),
        entities: [
          __dirname + '/**/**/*.entity{.ts,.js}',
          __dirname + '/**/*.entity{.ts,.js}',
        ],
        extra: {
          trustServerCertificate: true,
          encrypt: false,
          instanceName: 'SQLEXPRESS',
        },
        migrationsRun: false,
        autoLoadEntities: true,
        logging: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ProductosModule,
    MarcasModule,
    ProveedorModule,
    ClienteModule,
    ObraSocialModule,
    ClienteObraSocialModule,
  ],
})
export class AppModule {}
