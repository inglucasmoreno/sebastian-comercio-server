import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { movimientosSchema } from './schema/movimientos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Movimientos', schema: movimientosSchema },
		])
	],
  providers: [MovimientosService],
  controllers: [MovimientosController]
})
export class MovimientosModule {}
