import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CcProveedoresMovimientosController } from './cc-proveedores-movimientos.controller';
import { CcProveedoresMovimientosService } from './cc-proveedores-movimientos.service';
import { CcProveedoresMovimientosSchema } from './schema/cc-proveedores-movimientos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'CcProveedoresMovimientos', schema: CcProveedoresMovimientosSchema },
		])
	],
  controllers: [CcProveedoresMovimientosController],
  providers: [CcProveedoresMovimientosService]
})
export class CcProveedoresMovimientosModule {}
