import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComprasCajasController } from './compras-cajas.controller';
import { ComprasCajasService } from './compras-cajas.service';
import { comprasCajasSchema } from './schema/compras-cajas.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'ComprasCajas', schema: comprasCajasSchema },
		])
	],
  controllers: [ComprasCajasController],
  providers: [ComprasCajasService]
})
export class ComprasCajasModule {}
