import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { tiposGastosSchema } from './schema/tipos-gastos.schema';
import { TiposGastosController } from './tipos-gastos.controller';
import { TiposGastosService } from './tipos-gastos.service';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'TiposGastos', schema: tiposGastosSchema },
		])
	],
  controllers: [TiposGastosController],
  providers: [TiposGastosService]
})
export class TiposGastosModule {}
