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
import { CajasModule } from './cajas/cajas.module';
import { TiposMovimientosModule } from './tipos-movimientos/tipos-movimientos.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { CcClientesModule } from './cc-clientes/cc-clientes.module';
import { CcProveedoresModule } from './cc-proveedores/cc-proveedores.module';
import { CcClientesMovimientosModule } from './cc-clientes-movimientos/cc-clientes-movimientos.module';
import { CcProveedoresMovimientosModule } from './cc-proveedores-movimientos/cc-proveedores-movimientos.module';
import { BancosModule } from './bancos/bancos.module';
import { ChequesModule } from './cheques/cheques.module';
import { VentasPropiasModule } from './ventas-propias/ventas-propias.module';
import { VentasPropiasProductosModule } from './ventas-propias-productos/ventas-propias-productos.module';
import { VentasPropiasChequesModule } from './ventas-propias-cheques/ventas-propias-cheques.module';
import { CajasMovimientosModule } from './cajas-movimientos/cajas-movimientos.module';
import { RecibosCobroModule } from './recibos-cobro/recibos-cobro.module';
import { RecibosCobroVentaModule } from './recibos-cobro-venta/recibos-cobro-venta.module';
import { RecibosCobroChequeModule } from './recibos-cobro-cheque/recibos-cobro-cheque.module';
import { TiposGastosModule } from './tipos-gastos/tipos-gastos.module';
import { GastosModule } from './gastos/gastos.module';
import { ComprasModule } from './compras/compras.module';
import { ComprasProductosModule } from './compras-productos/compras-productos.module';
import { ComprasCajasModule } from './compras-cajas/compras-cajas.module';
import { OrdenesPagoModule } from './ordenes-pago/ordenes-pago.module';
import { OrdenesPagoCajasModule } from './ordenes-pago-cajas/ordenes-pago-cajas.module';
import { ComprasChequesModule } from './compras-cheques/compras-cheques.module';
import { OrdenesPagoChequesModule } from './ordenes-pago-cheques/ordenes-pago-cheques.module';
import { OrdenesPagoCompraModule } from './ordenes-pago-compra/ordenes-pago-compra.module';
import { MovimientosInternosModule } from './movimientos-internos/movimientos-internos.module';
import { ReportesModule } from './reportes/reportes.module';

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
    VentasProductosModule,
    CajasModule,
    TiposMovimientosModule,
    MovimientosModule,
    CcClientesModule,
    CcProveedoresModule,
    CcClientesMovimientosModule,
    CcProveedoresMovimientosModule,
    BancosModule,
    ChequesModule,
    VentasPropiasModule,
    VentasPropiasProductosModule,
    VentasPropiasChequesModule,
    CajasMovimientosModule,
    RecibosCobroModule,
    RecibosCobroVentaModule,
    RecibosCobroChequeModule,
    TiposGastosModule,
    GastosModule,
    ComprasModule,
    ComprasProductosModule,
    ComprasCajasModule,
    OrdenesPagoModule,
    OrdenesPagoCajasModule,
    ComprasChequesModule,
    OrdenesPagoChequesModule,
    OrdenesPagoCompraModule,
    MovimientosInternosModule,
    ReportesModule,
  ],
  
  controllers: [AppController],
  
  providers: [AppService]

})
export class AppModule {}
