import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ventasPropiasSchema } from 'src/ventas-propias/schema/ventas-propias.schema';
import { ventasPropiasProductosSchema } from './schema/ventas-propias-productos.schema';
import { VentasPropiasProductosController } from './ventas-propias-productos.controller';
import { VentasPropiasProductosService } from './ventas-propias-productos.service';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'VentasPropiasProductos', schema: ventasPropiasProductosSchema },
			{ name: 'VentasPropias', schema: ventasPropiasSchema },
		])
	],
  controllers: [VentasPropiasProductosController],
  providers: [VentasPropiasProductosService]
})
export class VentasPropiasProductosModule {}
