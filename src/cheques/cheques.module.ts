import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { proveedoresSchema } from 'src/proveedores/schema/proveedores.schema';
import { ChequesController } from './cheques.controller';
import { ChequesService } from './cheques.service';
import { chequesSchema } from './schema/cheques.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Cheques', schema: chequesSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'Proveedores', schema: proveedoresSchema },
		])
	],
  controllers: [ChequesController],
  providers: [ChequesService]
})
export class ChequesModule {}
