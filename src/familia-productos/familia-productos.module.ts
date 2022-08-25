import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliaProductosController } from './familia-productos.controller';
import { FamiliaProductosService } from './familia-productos.service';
import { familiaProductosSchema } from './schema/familia-productos.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
			{ name: 'FamiliaProductos', schema: familiaProductosSchema },
		])
	],
  controllers: [FamiliaProductosController],
  providers: [FamiliaProductosService]
})
export class FamiliaProductosModule {}
