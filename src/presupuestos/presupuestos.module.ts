import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { clientesSchema } from 'src/clientes/schema/clientes.schema';
import { presupuestosProductosSchema } from 'src/presupuesto-productos/schema/presupuesto-productos.schema';
import { PresupuestosController } from './presupuestos.controller';
import { PresupuestosService } from './presupuestos.service';
import { presupuestosSchema } from './schema/presupuestos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Presupuestos', schema: presupuestosSchema },
			{ name: 'Clientes', schema: clientesSchema },
			{ name: 'PresupuestoProductos', schema: presupuestosProductosSchema },
		])
	],
  controllers: [PresupuestosController],
  providers: [PresupuestosService]
})
export class PresupuestosModule {}
