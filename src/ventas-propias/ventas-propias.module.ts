import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { recibosCobrosSchema } from 'src/recibo-cobro/schema/recibo-cobro.schema';
import { ventasPropiasProductosSchema } from 'src/ventas-propias-productos/schema/ventas-propias-productos.schema';
import { ventasPropiasSchema } from './schema/ventas-propias.schema';
import { VentasPropiasController } from './ventas-propias.controller';
import { VentasPropiasService } from './ventas-propias.service';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'VentasPropias', schema: ventasPropiasSchema },
			{ name: 'Clientes', schema: clientesSchema },
			{ name: 'VentasPropiasProductos', schema: ventasPropiasProductosSchema },
			{ name: 'RecibosCobros', schema: recibosCobrosSchema },
		])
	],
  controllers: [VentasPropiasController],
  providers: [VentasPropiasService]
})
export class VentasPropiasModule {}
