import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CcClientesController } from './cc-clientes.controller';
import { CcClientesService } from './cc-clientes.service';
import { CcClientesSchema } from './schema/cc-clientes.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'CcClientes', schema: CcClientesSchema },
		])
	],
  controllers: [CcClientesController],
  providers: [CcClientesService]
})
export class CcClientesModule {}
