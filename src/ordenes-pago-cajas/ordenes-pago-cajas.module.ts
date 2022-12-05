import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdenesPagoCajasController } from './ordenes-pago-cajas.controller';
import { OrdenesPagoCajasService } from './ordenes-pago-cajas.service';
import { ordenesPagoCajasSchema } from './schema/ordenes-pago-cajas.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OrdenesPagoCajas', schema: ordenesPagoCajasSchema },
		])
	],
  controllers: [OrdenesPagoCajasController],
  providers: [OrdenesPagoCajasService]
})
export class OrdenesPagoCajasModule {}
