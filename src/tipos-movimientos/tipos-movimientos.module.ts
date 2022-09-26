import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { tiposMovimientosSchema } from './schema/tipos-movimientos.schema';
import { TiposMovimientosController } from './tipos-movimientos.controller';
import { TiposMovimientosService } from './tipos-movimientos.service';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'TiposMovimientos', schema: tiposMovimientosSchema },
		])
	],
  controllers: [TiposMovimientosController],
  providers: [TiposMovimientosService]
})
export class TiposMovimientosModule {}
