import { Module } from '@nestjs/common';
import { OperacionesVentasPropiasService } from './operaciones-ventas-propias.service';
import { OperacionesVentasPropiasController } from './operaciones-ventas-propias.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { operacionesVentasPropiasSchema } from './schema/operaciones-ventas-propias.schema';
import { operacionesSchema } from 'src/operaciones/schema/operaciones.schema';
import { ventasPropiasSchema } from 'src/ventas-propias/schema/ventas-propias.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OperacionesVentasPropias', schema: operacionesVentasPropiasSchema },
			{ name: 'VentasPropias', schema: ventasPropiasSchema },
			{ name: 'Operaciones', schema: operacionesSchema },
		])
	],
  providers: [OperacionesVentasPropiasService],
  controllers: [OperacionesVentasPropiasController]
})
export class OperacionesVentasPropiasModule {}
