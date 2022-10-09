import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { ChequesController } from './cheques.controller';
import { ChequesService } from './cheques.service';
import { chequesSchema } from './schema/cheques.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Cheques', schema: chequesSchema },
			{ name: 'Cajas', schema: cajasSchema },
		])
	],
  controllers: [ChequesController],
  providers: [ChequesService]
})
export class ChequesModule {}
