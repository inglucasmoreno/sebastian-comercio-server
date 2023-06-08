import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { comprasSchema } from 'src/compras/schema/compras.schema';
import { ventasSchema } from 'src/ventas/schema/ventas.schema';
import { ventasPropiasSchema } from 'src/ventas-propias/schema/ventas-propias.schema';
import { recibosCobroSchema } from 'src/recibos-cobro/schema/recibos-cobro.schema';
import { ordenesPagoSchema } from 'src/ordenes-pago/schema/ordenes-pago.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'VentasPropias', schema: ventasPropiasSchema },
      { name: 'Ventas', schema: ventasSchema },
      { name: 'Compras', schema: comprasSchema },
      { name: 'RecibosCobro', schema: recibosCobroSchema },
      { name: 'OrdenesPago', schema: ordenesPagoSchema },
		])
	],
  providers: [ReportesService],
  controllers: [ReportesController]
})
export class ReportesModule {}
