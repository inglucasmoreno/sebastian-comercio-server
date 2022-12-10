import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdenesPagoChequesController } from './ordenes-pago-cheques.controller';
import { OrdenesPagoChequesService } from './ordenes-pago-cheques.service';
import { ordenesPagoChequesSchema } from './schema/ordenes-pago-cheques.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OrdenesPagoCheques', schema: ordenesPagoChequesSchema },
		])
	],
  controllers: [OrdenesPagoChequesController],
  providers: [OrdenesPagoChequesService]
})
export class OrdenesPagoChequesModule {}
