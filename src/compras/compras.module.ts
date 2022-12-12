import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { CcProveedoresMovimientosSchema } from 'src/cc-proveedores-movimientos/schema/cc-proveedores-movimientos.schema';
import { CcProveedoresSchema } from 'src/cc-proveedores/schema/cc-proveedores.schema';
import { chequesSchema } from 'src/cheques/schema/cheques.schema';
import { comprasCajasSchema } from 'src/compras-cajas/schema/compras-cajas.schema';
import { comprasChequesSchema } from 'src/compras-cheques/schema/compras-cheques.schema';
import { comprasProductosSchema } from 'src/compras-productos/schema/compras-productos.schema';
import { ordenesPagoCompraSchema } from 'src/ordenes-pago-compra/schema/ordenes-pago-compra.schema';
import { ordenesPagoSchema } from 'src/ordenes-pago/schema/ordenes-pago.schema';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { comprasSchema } from './schema/compras.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Compras', schema: comprasSchema },
			{ name: 'ComprasProductos', schema: comprasProductosSchema },
			{ name: 'ComprasCajas', schema: comprasCajasSchema },
			{ name: 'ComprasCheques', schema: comprasChequesSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'CcProveedores', schema: CcProveedoresSchema },
			{ name: 'CcProveedoresMovimientos', schema: CcProveedoresMovimientosSchema },
			{ name: 'OrdenesPago', schema: ordenesPagoSchema },
			{ name: 'OrdenesPagoCompra', schema: ordenesPagoCompraSchema },
			{ name: 'Cheques', schema: chequesSchema },
		])
	],
  controllers: [ComprasController],
  providers: [ComprasService]
})
export class ComprasModule {}
