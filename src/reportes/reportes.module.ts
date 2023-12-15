import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { comprasSchema } from 'src/compras/schema/compras.schema';
import { ventasSchema } from 'src/ventas/schema/ventas.schema';
import { ventasPropiasSchema } from 'src/ventas-propias/schema/ventas-propias.schema';
import { recibosCobroSchema } from 'src/recibos-cobro/schema/recibos-cobro.schema';
import { ordenesPagoSchema } from 'src/ordenes-pago/schema/ordenes-pago.schema';
import { CcClientesSchema } from 'src/cc-clientes/schema/cc-clientes.schema';
import { CcProveedoresSchema } from 'src/cc-proveedores/schema/cc-proveedores.schema';
import { CcClientesMovimientosSchema } from 'src/cc-clientes-movimientos/schema/cc-clientes-movimientos.schema';
import { CcProveedoresMovimientosSchema } from 'src/cc-proveedores-movimientos/schema/cc-proveedores-movimientos.schema';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { operacionesSchema } from 'src/operaciones/schema/operaciones.schema';
import { operacionesVentasPropiasSchema } from 'src/operaciones-ventas-propias/schema/operaciones-ventas-propias.schema';
import { operacionesComprasSchema } from 'src/operaciones-compras/schema/operaciones-compras.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Operaciones', schema: operacionesSchema },
			{ name: 'OperacionesVentasPropias', schema: operacionesVentasPropiasSchema },
      { name: 'OperacionesCompras', schema: operacionesComprasSchema },
      { name: 'Cajas', schema: cajasSchema },
      { name: 'VentasPropias', schema: ventasPropiasSchema },
      { name: 'Ventas', schema: ventasSchema },
      { name: 'Compras', schema: comprasSchema },
      { name: 'RecibosCobro', schema: recibosCobroSchema },
      { name: 'OrdenesPago', schema: ordenesPagoSchema },
      { name: 'CcClientes', schema: CcClientesSchema },
      { name: 'CcProveedores', schema: CcProveedoresSchema },
      { name: 'CcClientesMovimientos', schema: CcClientesMovimientosSchema },
      { name: 'CcProveedoresMovimientos', schema: CcProveedoresMovimientosSchema },
      { name: 'CajasMovimientos', schema: CajasMovimientosSchema },
		])
	],
  providers: [ReportesService],
  controllers: [ReportesController]
})
export class ReportesModule {}
