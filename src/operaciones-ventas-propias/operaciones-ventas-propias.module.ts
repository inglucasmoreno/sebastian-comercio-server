import { Module } from '@nestjs/common';
import { OperacionesVentasPropiasService } from './operaciones-ventas-propias.service';
import { OperacionesVentasPropiasController } from './operaciones-ventas-propias.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { operacionesVentasPropiasSchema } from './schema/operaciones-ventas-propias.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OperacionesVentasPropias', schema: operacionesVentasPropiasSchema },
		])
	],
  providers: [OperacionesVentasPropiasService],
  controllers: [OperacionesVentasPropiasController]
})
export class OperacionesVentasPropiasModule {}
