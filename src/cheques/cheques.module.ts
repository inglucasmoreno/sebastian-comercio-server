import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { proveedoresSchema } from 'src/proveedores/schema/proveedores.schema';
import { ChequesController } from './cheques.controller';
import { ChequesService } from './cheques.service';
import { chequesSchema } from './schema/cheques.schema';
import { comprasChequesSchema } from 'src/compras-cheques/schema/compras-cheques.schema';
import { ventasPropiasChequesSchema } from 'src/ventas-propias-cheques/schema/ventas-propias-cheques.schema';
import { ordenesPagoChequesSchema } from 'src/ordenes-pago-cheques/schema/ordenes-pago-cheques.schema';
import { recibosCobroChequeSchema } from 'src/recibos-cobro-cheque/schema/recibos-cobro.schema';
import { recibosCobroVentaSchema } from 'src/recibos-cobro-venta/schema/recibos-cobro-venta.schema';
import { ordenesPagoCompraSchema } from 'src/ordenes-pago-compra/schema/ordenes-pago-compra.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Cheques', schema: chequesSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'Proveedores', schema: proveedoresSchema },
			{ name: 'comprasCheques', schema: comprasChequesSchema },
			{ name: 'ventasPropiasCheques', schema: ventasPropiasChequesSchema },
			{ name: 'ordenesPagoCheques', schema: ordenesPagoChequesSchema },
			{ name: 'recibosCobroCheques', schema: recibosCobroChequeSchema },
			{ name: 'recibosCobroVenta', schema: recibosCobroVentaSchema },
			{ name: 'ordenesPagoCompra', schema: ordenesPagoCompraSchema },

		])
	],
  controllers: [ChequesController],
  providers: [ChequesService]
})
export class ChequesModule {}
