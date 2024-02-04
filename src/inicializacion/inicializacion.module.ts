import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InicializacionController } from './inicializacion.controller';
import { InicializacionService } from './inicializacion.service';
import { usuarioSchema } from 'src/usuarios/schema/usuarios.schema';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { proveedoresSchema } from 'src/proveedores/schema/proveedores.schema';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { familiaProductosSchema } from 'src/familia-productos/schema/familia-productos.schema';
import { unidadMedidadSchema } from 'src/unidad-medida/schema/unidad-medida.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { tiposMovimientosSchema } from 'src/tipos-movimientos/schema/tipos-movimientos.schema';
import { operacionesSchema } from '../operaciones/schema/operaciones.schema';
import { operacionesVentasPropiasSchema } from 'src/operaciones-ventas-propias/schema/operaciones-ventas-propias.schema';
import { ventasPropiasSchema } from 'src/ventas-propias/schema/ventas-propias.schema';
import { comprasSchema } from 'src/compras/schema/compras.schema';
import { operacionesComprasSchema } from 'src/operaciones-compras/schema/operaciones-compras.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Usuario', schema: usuarioSchema}]),
    MongooseModule.forFeature([{name: 'Clientes', schema: clientesSchema}]),
    MongooseModule.forFeature([{name: 'Productos', schema: productosSchema}]),
    MongooseModule.forFeature([{name: 'Familias', schema: familiaProductosSchema}]),
    MongooseModule.forFeature([{name: 'UnidadMedida', schema: unidadMedidadSchema}]),
    MongooseModule.forFeature([{name: 'Proveedores', schema: proveedoresSchema}]),
    MongooseModule.forFeature([{name: 'Cajas', schema: cajasSchema}]),
    MongooseModule.forFeature([{name: 'TiposMovimientos', schema: tiposMovimientosSchema}]),
    MongooseModule.forFeature([{name: 'Operaciones', schema: operacionesSchema}]),
    MongooseModule.forFeature([{name: 'OperacionesVentasPropias', schema: operacionesVentasPropiasSchema}]),
    MongooseModule.forFeature([{name: 'VentasPropias', schema: ventasPropiasSchema}]),
    MongooseModule.forFeature([{name: 'Compras', schema: comprasSchema}]),
    MongooseModule.forFeature([{name: 'OperacionesCompras', schema: operacionesComprasSchema}]),
  ],
  controllers: [InicializacionController],
  providers: [InicializacionService]
})
export class InicializacionModule {}
