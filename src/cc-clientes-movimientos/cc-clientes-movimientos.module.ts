import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CcClientesSchema } from 'src/cc-clientes/schema/cc-clientes.schema';
import { CcClientesMovimientosController } from './cc-clientes-movimientos.controller';
import { CcClientesMovimientosService } from './cc-clientes-movimientos.service';
import { CcClientesMovimientosSchema } from './schema/cc-clientes-movimientos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'CcClientesMovimientos', schema: CcClientesMovimientosSchema },
			{ name: 'CcClientes', schema: CcClientesSchema }
		])
	],
  controllers: [CcClientesMovimientosController],
  providers: [CcClientesMovimientosService]
})
export class CcClientesMovimientosModule {}
