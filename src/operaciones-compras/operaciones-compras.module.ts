import { Module } from '@nestjs/common';
import { OperacionesComprasService } from './operaciones-compras.service';
import { OperacionesComprasController } from './operaciones-compras.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { operacionesComprasSchema } from './schema/operaciones-compras.schema';
import { comprasSchema } from 'src/compras/schema/compras.schema';
import { operacionesSchema } from 'src/operaciones/schema/operaciones.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OperacionesCompras', schema: operacionesComprasSchema },
			{ name: 'Compras', schema: comprasSchema },
			{ name: 'Operaciones', schema: operacionesSchema },
		])
	],
  providers: [OperacionesComprasService],
  controllers: [OperacionesComprasController]
})
export class OperacionesComprasModule {}
