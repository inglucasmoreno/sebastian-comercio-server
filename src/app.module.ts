import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MongoModule } from './config/mongo.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { InicializacionModule } from './inicializacion/inicializacion.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { UnidadMedidaModule } from './unidad-medida/unidad-medida.module';
import { ProductosModule } from './productos/productos.module';
import { ClientesModule } from './clientes/clientes.module';
import { PresupuestosModule } from './presupuestos/presupuestos.module';
import { PresupuestoProductosModule } from './presupuesto-productos/presupuesto-productos.module';
import { FamiliaProductosModule } from './familia-productos/familia-productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { VentasModule } from './ventas/ventas.module';
import { VentasProductosModule } from './ventas-productos/ventas-productos.module';

@Module({
  imports: [
      
    // Directorio publico
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  
    // Configuracion para variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  
    // Configuracion para JsonWebToken
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '12h' }
    }),
    
    // MongoDB
    MongoModule,
    
    // Modulos custom
    UsuariosModule, 
    AuthModule,
    InicializacionModule,
    UnidadMedidaModule,
    ProductosModule,
    ClientesModule,
    PresupuestosModule,
    PresupuestoProductosModule,
    FamiliaProductosModule,
    ProveedoresModule,
    VentasModule,
    VentasProductosModule,  // Para inicializacion de tablas - Configurable en el controlador/servicio
    
  ],
  
  controllers: [AppController],
  
  providers: [AppService]

})
export class AppModule {}
