import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasMovimientosSchema } from 'src/cajas-movimientos/schema/cajas-movimientos.schema';
import { MovimientosInternosSchema } from 'src/movimientos-internos/schema/movimientos-internos.schema';
import { CajasController } from './cajas.controller';
import { CajasService } from './cajas.service';
import { cajasSchema } from './schema/cajas.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'CajasMovimientos', schema: CajasMovimientosSchema },
			{ name: 'MovimientosInternos', schema: MovimientosInternosSchema },
		])
	],
  controllers: [CajasController],
  providers: [CajasService]
})
export class CajasModule {}
