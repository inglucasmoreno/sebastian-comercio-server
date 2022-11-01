import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecibosCobroVentaController } from './recibos-cobro-venta.controller';
import { RecibosCobroVentaService } from './recibos-cobro-venta.service';
import { recibosCobroVentaSchema } from './schema/recibos-cobro-venta.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'RecibosCobroVenta', schema: recibosCobroVentaSchema },
		])
	],
  controllers: [RecibosCobroVentaController],
  providers: [RecibosCobroVentaService]
})
export class RecibosCobroVentaModule {}
