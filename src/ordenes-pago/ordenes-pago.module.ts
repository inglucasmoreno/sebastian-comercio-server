import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdenesPagoController } from './ordenes-pago.controller';
import { OrdenesPagoService } from './ordenes-pago.service';
import { ordenesPagoSchema } from './schema/ordenes-pago.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OrdenesPago', schema: ordenesPagoSchema },
		])
	],
  controllers: [OrdenesPagoController],
  providers: [OrdenesPagoService]
})
export class OrdenesPagoModule {}
