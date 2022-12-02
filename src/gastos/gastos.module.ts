import { Module } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { GastosController } from './gastos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { gastosSchema } from './schema/gastos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Gastos', schema: gastosSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
		])
	],
  providers: [GastosService],
  controllers: [GastosController]
})
export class GastosModule {}
