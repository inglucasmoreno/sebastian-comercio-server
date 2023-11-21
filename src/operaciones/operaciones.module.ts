import { Module } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { operacionesSchema } from './schema/operaciones.schema';
import { operacionesVentasPropiasSchema } from 'src/operaciones-ventas-propias/schema/operaciones-ventas-propias.schema';
import { operacionesComprasSchema } from 'src/operaciones-compras/schema/operaciones-compras.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Operaciones', schema: operacionesSchema },
			{ name: 'OperacionesVentasPropias', schema: operacionesVentasPropiasSchema },
			{ name: 'OperacionesCompras', schema: operacionesComprasSchema },			
		])
	],
  providers: [OperacionesService],
  controllers: [OperacionesController]
})
export class OperacionesModule {}
