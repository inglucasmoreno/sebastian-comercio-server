import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { ventasSchema } from './schema/ventas.schema';
import { ventasProductosSchema } from 'src/ventas-productos/schema/ventas-productos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Ventas', schema: ventasSchema },
			{ name: 'Clientes', schema: clientesSchema },
			{ name: 'VentasProductos', schema: ventasProductosSchema },
		])
	],
  providers: [VentasService],
  controllers: [VentasController]
})
export class VentasModule {}
