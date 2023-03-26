import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { CcClientesMovimientosSchema } from 'src/cc-clientes-movimientos/schema/cc-clientes-movimientos.schema';
import { CcClientesSchema } from 'src/cc-clientes/schema/cc-clientes.schema';
import { chequesSchema } from 'src/cheques/schema/cheques.schema';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { recibosCobroVentaSchema } from 'src/recibos-cobro-venta/schema/recibos-cobro-venta.schema';
import { ventasPropiasChequesSchema } from 'src/ventas-propias-cheques/schema/ventas-propias-cheques.schema';
import { ventasPropiasProductosSchema } from 'src/ventas-propias-productos/schema/ventas-propias-productos.schema';
import { ventasPropiasSchema } from './schema/ventas-propias.schema';
import { VentasPropiasController } from './ventas-propias.controller';
import { VentasPropiasService } from './ventas-propias.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'VentasPropias', schema: ventasPropiasSchema },
			{ name: 'Productos', schema: productosSchema },
			{ name: 'Cheques', schema: chequesSchema },
			{ name: 'VentasPropiasCheques', schema: ventasPropiasChequesSchema },
			{ name: 'Clientes', schema: clientesSchema },
			{ name: 'CcClientes', schema: CcClientesSchema },
			{ name: 'CcClientesMovimientos', schema: CcClientesMovimientosSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'VentasPropiasProductos', schema: ventasPropiasProductosSchema },
			{ name: 'RecibosCobroVenta', schema: recibosCobroVentaSchema },
		])
	],
	controllers: [VentasPropiasController],
	providers: [VentasPropiasService]
})
export class VentasPropiasModule { }
