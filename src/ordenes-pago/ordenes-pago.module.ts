import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { CcProveedoresMovimientosSchema } from 'src/cc-proveedores-movimientos/schema/cc-proveedores-movimientos.schema';
import { CcProveedoresSchema } from 'src/cc-proveedores/schema/cc-proveedores.schema';
import { chequesSchema } from 'src/cheques/schema/cheques.schema';
import { comprasSchema } from 'src/compras/schema/compras.schema';
import { ordenesPagoChequesSchema } from 'src/ordenes-pago-cheques/schema/ordenes-pago-cheques.schema';
import { ordenesPagoCompraSchema } from 'src/ordenes-pago-compra/schema/ordenes-pago-compra.schema';
import { OrdenesPagoController } from './ordenes-pago.controller';
import { OrdenesPagoService } from './ordenes-pago.service';
import { ordenesPagoSchema } from './schema/ordenes-pago.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'Cheques', schema: chequesSchema },
			{ name: 'Compras', schema: comprasSchema },
			{ name: 'OrdenesPago', schema: ordenesPagoSchema },
			{ name: 'OrdenesPagoCompra', schema: ordenesPagoCompraSchema },
			{ name: 'OrdenesPagoCheque', schema: ordenesPagoChequesSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'CcProveedores', schema: CcProveedoresSchema },
			{ name: 'CcProveedoresMovimientos', schema: CcProveedoresMovimientosSchema },
		])
	],
  controllers: [OrdenesPagoController],
  providers: [OrdenesPagoService]
})
export class OrdenesPagoModule {}
