import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';
import { MarcasModule } from './marcas/marcas.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ClienteModule } from './cliente/cliente.module';
import { ObraSocialModule } from './obra-social/obra-social.module';
import { ClienteObraSocialModule } from './cliente-obra-social/cliente-obra-social.module';
import { CuentaCorrienteModule } from './cuenta-corriente/cuenta-corriente.module';
import { MovimientoModule } from './movimiento/movimiento.module';
import { VentasModule } from './ventas/ventas.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
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
        synchronize: true,
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ProductosModule,
    MarcasModule,
    ProveedorModule,
    ClienteModule,
    ObraSocialModule,
    ClienteObraSocialModule,
    CuentaCorrienteModule,
    MovimientoModule,
    VentasModule,
  ],
})
export class AppModule {}
