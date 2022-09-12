import { Module } from '@nestjs/common';
import { VentasProductosService } from './ventas-productos.service';
import { VentasProductosController } from './ventas-productos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasProductosSchema } from './schema/ventas-productos.schema';
import { ventasSchema } from 'src/ventas/schema/ventas.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'VentaProductos', schema: ventasProductosSchema },
			{ name: 'Ventas', schema: ventasSchema },
		])
	],
  providers: [VentasProductosService],
  controllers: [VentasProductosController]
})
export class VentasProductosModule {}
