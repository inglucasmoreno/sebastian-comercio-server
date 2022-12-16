import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MovimientosInternosController } from './movimientos-internos.controller';
import { MovimientosInternosService } from './movimientos-internos.service';
import { MovimientosInternosSchema } from './schema/movimientos-internos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'MovimientosInternos', schema: MovimientosInternosSchema },
		])
	],
  controllers: [MovimientosInternosController],
  providers: [MovimientosInternosService]
})
export class MovimientosInternosModule {}
