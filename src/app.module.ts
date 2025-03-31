import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudiometriaModule } from './audiometria/audiometria.module';
import { AuthModule } from './auth/auth.module';
import { ClienteObraSocialModule } from './cliente-obra-social/cliente-obra-social.module';
import { ClienteModule } from './cliente/cliente.module';
import { CommonsModule } from './common/commons.module';
import { ComprobanteModule } from './comprobante/comprobante.module';
import { DatabaseService } from './config/database.service';
import { CuentaCorrienteModule } from './cuenta-corriente/cuenta-corriente.module';
import { DetallesRecetaLentesAereosModule } from './detalles-receta-lentes-aereos/detalles-receta-lentes-aereos.module';
import { HistoriaClinicaLentesContactoModule } from './historia-clinica-lentes-contacto/historia-clinica-lentes-contacto.module';
import { LocalidadModule } from './localidad/localidad.module';
import { MarcaModule } from './marca/marca.module';
import { MovimientoModule } from './movimiento/movimiento.module';
import { ObraSocialModule } from './obra-social/obra-social.module';
import { ParametrosModule } from './parametros/parametros.module';
import { ProductoModule } from './producto/producto.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { ProvinciaModule } from './provincia/provincia.module';
import { RecetaLentesAereosModule } from './receta-lentes-aereos/receta-lentes-aereos.module';
import { RecetaLentesContactoModule } from './receta-lentes-contacto/receta-lentes-contacto.module';
import { UserModule } from './user/user.module';
import { VentaObraSocialModule } from './venta-obra-social/venta-obra-social.module';
import { VentaModule } from './venta/venta.module';
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    DatabaseService,
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
        limit: 100,
      },
    ]),
    ProductoModule,
    MarcaModule,
    ProveedorModule,
    ClienteModule,
    ObraSocialModule,
    ClienteObraSocialModule,
    CuentaCorrienteModule,
    VentaModule,
    MovimientoModule,
    HistoriaClinicaLentesContactoModule,
    RecetaLentesContactoModule,
    AudiometriaModule,
    RecetaLentesAereosModule,
    DetallesRecetaLentesAereosModule,
    LocalidadModule,
    ProvinciaModule,
    UserModule,
    AuthModule,
    ComprobanteModule,
    VentaObraSocialModule,
    CommonsModule,
    ParametrosModule,
  ],
})
export class AppModule {}
