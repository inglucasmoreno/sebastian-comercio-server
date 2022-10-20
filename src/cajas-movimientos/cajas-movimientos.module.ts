import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { CajasMovimientosController } from './cajas-movimientos.controller';
import { CajasMovimientosService } from './cajas-movimientos.service';
import { CajasMovimientosSchema } from './schema/cajas-movimientos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'Cajas', schema: cajasSchema }
		])
	],
  controllers: [CajasMovimientosController],
  providers: [CajasMovimientosService]
})
export class CajasMovimientosModule {}
