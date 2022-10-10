import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { productosSchema } from 'src/productos/schema/productos.schema';
import { ventasPropiasChequesSchema } from './schema/ventas-propias-cheques.schema';
import { VentasPropiasChequesController } from './ventas-propias-cheques.controller';
import { VentasPropiasChequesService } from './ventas-propias-cheques.service';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'VentasPropiasCheques', schema: ventasPropiasChequesSchema },
			{ name: 'Productos', schema: productosSchema },
		])
	],
  controllers: [VentasPropiasChequesController],
  providers: [VentasPropiasChequesService]
})
export class VentasPropiasChequesModule {}
