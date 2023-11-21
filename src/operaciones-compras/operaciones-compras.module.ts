import { Module } from '@nestjs/common';
import { OperacionesComprasService } from './operaciones-compras.service';
import { OperacionesComprasController } from './operaciones-compras.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { operacionesComprasSchema } from './schema/operaciones-compras.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'OperacionesCompras', schema: operacionesComprasSchema },
		])
	],
  providers: [OperacionesComprasService],
  controllers: [OperacionesComprasController]
})
export class OperacionesComprasModule {}
