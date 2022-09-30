import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { movimientosSchema } from './schema/movimientos.schema';
import { tiposMovimientosSchema } from 'src/tipos-movimientos/schema/tipos-movimientos.schema';
import { cajasSchema } from 'src/cajas/schema/cajas.schema';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { proveedoresSchema } from 'src/proveedores/schema/proveedores.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Movimientos', schema: movimientosSchema },
			{ name: 'Clientes', schema: clientesSchema },
			{ name: 'Proveedores', schema: proveedoresSchema },
			{ name: 'Cajas', schema: cajasSchema },
			{ name: 'TiposMovimientos', schema: tiposMovimientosSchema },
		])
	],
  providers: [MovimientosService],
  controllers: [MovimientosController]
})
export class MovimientosModule {}
