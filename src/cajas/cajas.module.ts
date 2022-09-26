import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CajasController } from './cajas.controller';
import { CajasService } from './cajas.service';
import { cajasSchema } from './schema/cajas.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Cajas', schema: cajasSchema },
		])
	],
  controllers: [CajasController],
  providers: [CajasService]
})
export class CajasModule {}
