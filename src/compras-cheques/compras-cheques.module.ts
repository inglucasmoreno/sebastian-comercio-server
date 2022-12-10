import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComprasChequesController } from './compras-cheques.controller';
import { ComprasChequesService } from './compras-cheques.service';
import { comprasChequesSchema } from './schema/compras-cheques.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'ComprasCheques', schema: comprasChequesSchema },
		])
	],
  controllers: [ComprasChequesController],
  providers: [ComprasChequesService]
})
export class ComprasChequesModule {}
