import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { comprasSchema } from 'src/compras/schema/compras.schema';
import { ComprasProductosController } from './compras-productos.controller';
import { ComprasProductosService } from './compras-productos.service';
import { comprasProductosSchema } from './schema/compras-productos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'ComprasProductos', schema: comprasProductosSchema },
			{ name: 'Compras', schema: comprasSchema },
		])
	],
  controllers: [ComprasProductosController],
  providers: [ComprasProductosService]
})
export class ComprasProductosModule {}
