import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { presupuestosSchema } from 'src/presupuestos/schema/presupuestos.schema';
import { PresupuestoProductosController } from './presupuesto-productos.controller';
import { PresupuestoProductosService } from './presupuesto-productos.service';
import { presupuestosProductosSchema } from './schema/presupuesto-productos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'PresupuestoProductos', schema: presupuestosProductosSchema },
			{ name: 'Presupuestos', schema: presupuestosSchema },
		])
	],
  controllers: [PresupuestoProductosController],
  providers: [PresupuestoProductosService]
})
export class PresupuestoProductosModule {}
