import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresupuestoProductosController } from './presupuesto-productos.controller';
import { PresupuestoProductosService } from './presupuesto-productos.service';
import { presupuestosProductosSchema } from './schema/presupuesto-productos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'PresupuestoProductos', schema: presupuestosProductosSchema },
		])
	],
  controllers: [PresupuestoProductosController],
  providers: [PresupuestoProductosService]
})
export class PresupuestoProductosModule {}
