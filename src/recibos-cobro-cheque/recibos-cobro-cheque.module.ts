import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecibosCobroChequeController } from './recibos-cobro-cheque.controller';
import { RecibosCobroChequeService } from './recibos-cobro-cheque.service';
import { recibosCobroChequeSchema } from './schema/recibos-cobro.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'RecibosCobroCheque', schema: recibosCobroChequeSchema },
		])
	],
  controllers: [RecibosCobroChequeController],
  providers: [RecibosCobroChequeService]
})
export class RecibosCobroChequeModule {}
