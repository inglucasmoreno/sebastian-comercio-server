import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { CcClientesMovimientosSchema } from 'src/cc-clientes-movimientos/schema/cc-clientes-movimientos.schema';
import { CcClientesSchema } from 'src/cc-clientes/schema/cc-clientes.schema';
import { chequesSchema } from 'src/cheques/schema/cheques.schema';
import { recibosCobroChequeSchema } from 'src/recibos-cobro-cheque/schema/recibos-cobro.schema';
import { recibosCobroVentaSchema } from 'src/recibos-cobro-venta/schema/recibos-cobro-venta.schema';
import { RecibosCobroController } from './recibos-cobro.controller';
import { RecibosCobroService } from './recibos-cobro.service';
import { recibosCobroSchema } from './schema/recibos-cobro.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'RecibosCobro', schema: recibosCobroSchema },
			{ name: 'RecibosCobroVenta', schema: recibosCobroVentaSchema },
			{ name: 'RecibosCobroCheque', schema: recibosCobroChequeSchema },
			{ name: 'Cheques', schema: chequesSchema },
			{ name: 'CcClientes', schema: CcClientesSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CcClientesMovimientos', schema: CcClientesMovimientosSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
		])
	],
  controllers: [RecibosCobroController],
  providers: [RecibosCobroService]
})
export class RecibosCobroModule {}
