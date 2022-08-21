import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresupuestosController } from './presupuestos.controller';
import { PresupuestosService } from './presupuestos.service';
import { presupuestosSchema } from './schema/presupuestos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'Presupuestos', schema: presupuestosSchema },
		])
	],
  controllers: [PresupuestosController],
  providers: [PresupuestosService]
})
export class PresupuestosModule {}
