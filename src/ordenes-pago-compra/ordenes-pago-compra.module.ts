import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdenesPagoCompraController } from './ordenes-pago-compra.controller';
import { OrdenesPagoCompraService } from './ordenes-pago-compra.service';
import { ordenesPagoCompraSchema } from './schema/ordenes-pago-compra.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OrdenesPagoCompra', schema: ordenesPagoCompraSchema },
		])
	],
  controllers: [OrdenesPagoCompraController],
  providers: [OrdenesPagoCompraService]
})
export class OrdenesPagoCompraModule {}
